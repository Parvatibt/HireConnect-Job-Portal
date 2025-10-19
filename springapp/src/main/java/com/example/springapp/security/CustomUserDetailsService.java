package com.example.springapp.security;

import com.example.springapp.model.Role;
import com.example.springapp.model.User;
import com.example.springapp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * UserDetailsService with explicit debug logging to diagnose failed login attempts.
 */
@Service("userDetailsService")
@Primary
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
        log.info("CustomUserDetailsService constructed");
    }

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        log.debug("loadUserByUsername called with '{}'", usernameOrEmail);
        Optional<User> opt = userRepository.findByUsername(usernameOrEmail);
        if (opt.isEmpty()) {
            opt = userRepository.findByEmail(usernameOrEmail);
        }

        if (opt.isEmpty()) {
            log.warn("User not found by username or email: '{}'", usernameOrEmail);
            throw new UsernameNotFoundException("User not found: " + usernameOrEmail);
        }

        User user = opt.get();
        log.debug("Found user id={} username={} email={}", user.getId(), user.getUsername(), user.getEmail());
        String pw = user.getPassword();
        log.debug("Password column present? {}", (pw != null && !pw.isBlank() ? "yes" : "no"));
        if (pw != null && pw.length() > 0) {
            // only log prefix to avoid exposing full hash
            log.debug("Password hash prefix: {}", pw.length() > 6 ? pw.substring(0, 6) + "..." : pw);
        }

        List<GrantedAuthority> authorities = Optional.ofNullable(user.getRoles())
                .orElse(Collections.emptySet())
                .stream()
                .map(Role::getName)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(r -> r.startsWith("ROLE_") ? r : ("ROLE_" + r))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        log.debug("Mapped authorities for user {}: {}", user.getUsername(), authorities.stream().map(GrantedAuthority::getAuthority).toList());

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername() == null ? user.getEmail() : user.getUsername())
                .password(user.getPassword())
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}
