package com.example.springapp.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    private final Key key;
    private final long validitySeconds;

    // jwt.secret from application.properties
    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.expiration.seconds:3600}") long validitySeconds) {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalArgumentException("jwt.secret must be set in application.properties");
        }
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        // Defensive: warn if secret length might be too short for strong keys
        if (keyBytes.length < 32) {
            log.warn("jwt.secret appears short ({} bytes). For HS256 prefer at least 32 bytes.", keyBytes.length);
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.validitySeconds = validitySeconds;
    }

    /** Create a token for testing / issuance. roles may be null or a List<String> like ["RECRUITER"] */
    public String generateToken(String subject, List<String> roles) {
        Instant now = Instant.now();
        JwtBuilder builder = Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(validitySeconds)));

        if (roles != null && !roles.isEmpty()) {
            builder.claim("roles", roles);
        }
        return builder.signWith(key, SignatureAlgorithm.HS256).compact();
    }

    /** Validate signature and expiry -- logs reason on failure */
    public boolean validate(String token) {
        try {
            Jws<Claims> parsed = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            // parseClaimsJws throws JwtException if invalid or expired
            return true;
        } catch (ExpiredJwtException ex) {
            log.debug("JwtUtil: token expired: {} (exp={}, subject={})", ex.getMessage(),
                    ex.getClaims() != null ? ex.getClaims().getExpiration() : "n/a",
                    ex.getClaims() != null ? ex.getClaims().getSubject() : "n/a");
        } catch (UnsupportedJwtException ex) {
            log.debug("JwtUtil: unsupported jwt: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.debug("JwtUtil: malformed jwt: {}", ex.getMessage());
        } catch (SignatureException ex) {
            log.debug("JwtUtil: signature validation failed: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.debug("JwtUtil: illegal argument while validating token: {}", ex.getMessage());
        } catch (JwtException ex) {
            log.debug("JwtUtil: jwt exception: {}", ex.getMessage());
        } catch (Exception ex) {
            log.error("JwtUtil: unexpected error validating token", ex);
        }
        return false;
    }

    /** extract username/subject (returns null on error) */
    public String extractUsername(String token) {
        try {
            Claims c = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
            return c.getSubject();
        } catch (Exception e) {
            log.debug("JwtUtil: extractUsername failed: {}", e.getMessage());
            return null;
        }
    }

    /** get all claims (returns null on error) */
    public Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        } catch (ExpiredJwtException ex) {
            log.debug("JwtUtil.extractAllClaims: token expired: {}", ex.getMessage());
            return null;
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("JwtUtil.extractAllClaims: invalid token: {}", ex.getMessage());
            return null;
        } catch (Exception ex) {
            log.error("JwtUtil.extractAllClaims: unexpected", ex);
            return null;
        }
    }
}
