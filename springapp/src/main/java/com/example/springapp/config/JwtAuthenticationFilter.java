package com.example.springapp.config;

import com.example.springapp.model.User;
import com.example.springapp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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

/**
 * JWT auth filter — robust public-path skip (handles context path) and debug logging.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    // List of public path prefixes (these are matched after removing context path)
    private static final List<String> PUBLIC_PATH_PREFIXES = List.of(
            "/v3/api-docs",
            "/v3/api-docs/",
            "/v2/api-docs",
            "/swagger-ui",
            "/swagger-ui.html",
            "/swagger-resources",
            "/webjars",
            "/configuration",
            "/actuator",
            "/favicon.ico"
    );

    private boolean isPublicPathNormalized(String normalizedPath) {
        return PUBLIC_PATH_PREFIXES.stream().anyMatch(normalizedPath::startsWith);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Normalize path by removing the context path, if any
        String contextPath = Optional.ofNullable(request.getContextPath()).orElse("");
        String requestUri = Optional.ofNullable(request.getRequestURI()).orElse("");
        String normalizedPath = requestUri;
        if (!contextPath.isEmpty() && requestUri.startsWith(contextPath)) {
            normalizedPath = requestUri.substring(contextPath.length());
        }

        logger.debug("JwtFilter: requestUri='{}', contextPath='{}', normalizedPath='{}', method={}",
                requestUri, contextPath, normalizedPath, request.getMethod());

        // If the request is to any known public path, skip JWT validation
        if (isPublicPathNormalized(normalizedPath)) {
            logger.debug("JwtFilter: skipping public path '{}'", normalizedPath);
            filterChain.doFilter(request, response);
            return;
        }

        // Continue with existing JWT flow (graceful early returns if token missing/invalid)
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("JwtFilter: no Bearer token present on '{}'", normalizedPath);
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validate(token)) {
            logger.debug("JwtFilter: token invalid for '{}'", normalizedPath);
            filterChain.doFilter(request, response);
            return;
        }

        String username = jwtUtil.extractUsername(token);
        if (username == null) {
            logger.debug("JwtFilter: token has no username for '{}'", normalizedPath);
            filterChain.doFilter(request, response);
            return;
        }

        Optional<User> opt = userRepository.findByUsername(username);
        if (opt.isEmpty()) {
            logger.debug("JwtFilter: user not found '{}' for '{}'", username, normalizedPath);
            filterChain.doFilter(request, response);
            return;
        }

        User user = opt.get();
        var authorities = user.getRoles().stream()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getName()))
                .collect(Collectors.toList());

        var auth = new UsernamePasswordAuthenticationToken(username, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }
}
