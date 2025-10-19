package com.example.springapp.config;

import com.example.springapp.model.User;
import com.example.springapp.repository.UserRepository;
import com.example.springapp.security.AuthPrincipal;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    // Public paths (skip auth parsing completely)
    private static final List<String> PUBLIC_PATH_PREFIXES = List.of(
            "/v3/api-docs",
            "/v2/api-docs",
            "/swagger-ui",
            "/swagger-ui.html",
            "/swagger-resources",
            "/webjars",
            "/configuration",
            "/actuator",
            "/favicon.ico",
            "/api/auth",
            "/api/stats"   // <-- add this so /api/stats/** never triggers JWT handling
    );

    private boolean isPublicPath(String normalizedPath) {
        for (String p : PUBLIC_PATH_PREFIXES) {
            if (normalizedPath.startsWith(p)) return true;
        }
        return false;
    }

    private void sendUnauthorized(HttpServletResponse response, String message, String path) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        Map<String, Object> body = Map.of(
                "status", HttpServletResponse.SC_UNAUTHORIZED,
                "error", "Unauthorized",
                "message", message == null ? "Authentication required" : message,
                "path", path
        );
        objectMapper.writeValue(response.getOutputStream(), body);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String contextPath = Optional.ofNullable(request.getContextPath()).orElse("");
        String requestUri  = Optional.ofNullable(request.getRequestURI()).orElse("");
        String normalized  = requestUri.startsWith(contextPath) ? requestUri.substring(contextPath.length()) : requestUri;
        String method      = Optional.ofNullable(request.getMethod()).orElse("GET");

        if ("OPTIONS".equalsIgnoreCase(method) || isPublicPath(normalized)) {
            filterChain.doFilter(request, response);
            return;
        }

        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String authHeader = Optional.ofNullable(request.getHeader("Authorization"))
                    .orElse(request.getHeader("authorization"));

            if (authHeader == null) {
                filterChain.doFilter(request, response);
                return;
            }

            String headerTrim = authHeader.trim();
            if (!headerTrim.regionMatches(true, 0, "Bearer ", 0, 7)) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = headerTrim.substring(7).trim();
            if (token.isEmpty()) {
                filterChain.doFilter(request, response);
                return;
            }

            if (!jwtUtil.validate(token)) {
                sendUnauthorized(response, "Invalid or expired token", normalized);
                return;
            }

            String username = Optional.ofNullable(jwtUtil.extractUsername(token)).orElse("").trim();
            if (username.isEmpty()) {
                sendUnauthorized(response, "Token subject missing", normalized);
                return;
            }

            List<GrantedAuthority> authorities = new ArrayList<>();

            try {
                Claims claims = jwtUtil.extractAllClaims(token);
                Object rolesObj = (claims != null) ? claims.get("roles") : null;
                if (rolesObj instanceof List<?> list) {
                    for (Object o : list) {
                        String r = String.valueOf(o).trim().toUpperCase(Locale.ROOT);
                        if (!r.startsWith("ROLE_")) r = "ROLE_" + r;
                        authorities.add(new SimpleGrantedAuthority(r));
                    }
                }
            } catch (Exception ignored) {}

            try {
                userRepository.findByUsername(username).or(() -> userRepository.findByEmail(username))
                        .ifPresent(u -> {
                            if (u.getRoles() != null) {
                                Set<String> existing = authorities.stream()
                                        .map(GrantedAuthority::getAuthority).collect(Collectors.toSet());
                                u.getRoles().forEach(role -> {
                                    String r = role.getName();
                                    if (r != null) {
                                        r = r.trim().replace(' ', '_').toUpperCase(Locale.ROOT);
                                        if (!r.startsWith("ROLE_")) r = "ROLE_" + r;
                                        if (existing.add(r)) {
                                            authorities.add(new SimpleGrantedAuthority(r));
                                        }
                                    }
                                });
                            }
                        });
            } catch (Exception ignored) {}

            AuthPrincipal principal = new AuthPrincipal(username);
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(principal, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception ex) {
            // if anything unexpected happens while parsing token, respond 401 with a clear message
            sendUnauthorized(response, "Authentication processing error", normalized);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
