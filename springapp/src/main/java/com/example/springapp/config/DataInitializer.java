package com.example.springapp.config;

import com.example.springapp.model.Role;
import com.example.springapp.model.User;
import com.example.springapp.repository.RoleRepository;
import com.example.springapp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

/**
 * Ensures required roles exist and creates/repairs a default admin account on startup (if needed).
 *
 * NOTE: For dev only -- this will update an existing admin user's password to the configured
 * ADMIN_PASSWORD if it doesn't already match. Remove or harden for production.
 */
@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    // --- Default Admin Credentials (change if desired)
    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_EMAIL = "admin";
    private static final String ADMIN_PASSWORD = "Admin@123"; // will be encoded
    private static final String ADMIN_FIRST_NAME = "System";
    private static final String ADMIN_LAST_NAME = "Admin";
    private static final String ADMIN_PHONE = "7892762549";

    @Bean
    public ApplicationRunner initializer(UserRepository userRepository,
                                         RoleRepository roleRepository,
                                         PasswordEncoder passwordEncoder) {
        return args -> {
            createRolesIfMissing(roleRepository);
            createOrRepairAdmin(userRepository, roleRepository, passwordEncoder);
        };
    }

    @Transactional
    protected void createRolesIfMissing(RoleRepository roleRepository) {
        createRoleIfMissing(roleRepository, "ROLE_ADMIN");
        createRoleIfMissing(roleRepository, "ROLE_RECRUITER");
        createRoleIfMissing(roleRepository, "ROLE_CANDIDATE");
    }

    private void createRoleIfMissing(RoleRepository roleRepository, String roleName) {
        Optional<Role> existing = roleRepository.findByName(roleName);
        if (existing.isPresent()) {
            log.debug("Role '{}' already exists", roleName);
            return;
        }
        Role r = new Role();
        r.setName(roleName);
        roleRepository.save(r);
        log.info("Created role '{}'", roleName);
    }

    /**
     * Create admin user if missing; if present ensure password matches ADMIN_PASSWORD
     * and that ROLE_ADMIN is assigned. This is intentionally lenient for development.
     */
    @Transactional
    protected void createOrRepairAdmin(UserRepository userRepository,
                                       RoleRepository roleRepository,
                                       PasswordEncoder passwordEncoder) {

        Optional<Role> adminRoleOpt = roleRepository.findByName("ROLE_ADMIN");
        if (adminRoleOpt.isEmpty()) {
            log.error("ROLE_ADMIN not found. Cannot create admin user. Make sure role table exists.");
            return;
        }
        Role adminRole = adminRoleOpt.get();

        Optional<User> existingOpt = userRepository.findByUsername(ADMIN_USERNAME);
        if (existingOpt.isPresent()) {
            User admin = existingOpt.get();
            boolean changed = false;

            // Ensure admin has ROLE_ADMIN
            if (admin.getRoles() == null) {
                admin.setRoles(new HashSet<>());
            }
            boolean hasAdminRole = admin.getRoles().stream()
                    .anyMatch(r -> "ROLE_ADMIN".equalsIgnoreCase(r.getName()));
            if (!hasAdminRole) {
                admin.getRoles().add(adminRole);
                changed = true;
                log.info("Added ROLE_ADMIN to existing user '{}'", ADMIN_USERNAME);
            }

            // Ensure password matches the desired ADMIN_PASSWORD (only for dev environments)
            try {
                boolean matches = passwordEncoder.matches(ADMIN_PASSWORD, admin.getPassword());
                if (!matches) {
                    admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
                    changed = true;
                    log.info("Updated password for existing admin user '{}'", ADMIN_USERNAME);
                }
            } catch (Exception ex) {
                // If password column is null or corrupt, just re-encode
                admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
                changed = true;
                log.warn("Re-encoded password for admin due to exception: {}", ex.getMessage());
            }

            if (changed) {
                userRepository.save(admin);
                log.info("Repaired admin user '{}'", ADMIN_USERNAME);
            } else {
                log.info("Admin user '{}' exists and is up-to-date", ADMIN_USERNAME);
            }
            return;
        }

        // Create new admin user if missing
        User admin = new User();
        admin.setUsername(ADMIN_USERNAME);
        admin.setEmail(ADMIN_EMAIL);
        admin.setFirstName(ADMIN_FIRST_NAME);
        admin.setLastName(ADMIN_LAST_NAME);
        admin.setPhone(ADMIN_PHONE);

        // encode password
        admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));

        // assign admin role
        Set<Role> roles = new HashSet<>();
        roles.add(adminRole);
        admin.setRoles(roles);

        userRepository.save(admin);

        log.info("Created admin user '{}' (password: '{}').", ADMIN_USERNAME, ADMIN_PASSWORD);
        log.info("IMPORTANT: change the admin password in production or delete this initializer.");
    }
}
