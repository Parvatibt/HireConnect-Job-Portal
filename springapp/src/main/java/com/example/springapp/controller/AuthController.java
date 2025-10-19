package com.example.springapp.controller;

import com.example.springapp.dto.AuthRequest;
import com.example.springapp.dto.RegisterRequest;
import com.example.springapp.model.Candidate;
import com.example.springapp.model.Role;
import com.example.springapp.model.User;
import com.example.springapp.repository.CandidateRepository;
import com.example.springapp.repository.UserRepository;
import com.example.springapp.service.RoleService;
import com.example.springapp.config.JwtUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.springapp.dto.ResetByUsernameRequest;

import jakarta.validation.Valid;
import java.util.Optional;
import java.util.Set;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * Authentication controller (register / login / forgot-password).
 *
 * Updated: login now generates a token including roles (List<String>) to match JwtUtil.generateToken(subject, roles).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepo;
    private final CandidateRepository candidateRepo;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;


    public AuthController(UserRepository userRepo,
                          CandidateRepository candidateRepo,
                          RoleService roleService,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authManager,
                          JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.candidateRepo = candidateRepo;
        this.roleService = roleService;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
    }

    // Register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.getUsername() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username and password required"));
        }
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Passwords do not match"));
        }
        if (userRepo.existsByUsername(req.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already taken"));
        }
        if (req.getEmail() != null && userRepo.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already used"));
        }

        User u = new User();
        u.setUsername(req.getUsername());
        u.setEmail(req.getEmail());
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());
        u.setPhone(req.getPhone());

        // Accept role from either "role" or "extra"
        String roleKey = (req.getRole() != null && !req.getRole().isBlank())
                ? req.getRole()
                : req.getExtra();

        Role role;
        if ("recruiter".equalsIgnoreCase(roleKey) || "employer".equalsIgnoreCase(roleKey)) {
            role = roleService.findByName("ROLE_RECRUITER").orElse(null);
        } else if ("candidate".equalsIgnoreCase(roleKey)) {
            role = roleService.findByName("ROLE_CANDIDATE").orElse(null);
        } else {
            role = roleService.findByName("ROLE_USER").orElse(null);
        }

        if (role == null) {
            System.err.println("Register failed: roleKey=" + roleKey + " not found in roles table!");
            return ResponseEntity.internalServerError().body(Map.of("message", "Server role configuration missing"));
        }

        u.setRoles(Set.of(role));
        userRepo.save(u);

        // If this user is a candidate, create a Candidate row (if none exists)
        if ("ROLE_CANDIDATE".equalsIgnoreCase(role.getName()) || "CANDIDATE".equalsIgnoreCase(role.getName())) {
            // Only create if not already present
            Optional<Candidate> existing = candidateRepo.findByUsername(u.getUsername());
            if (existing.isEmpty()) {
                Candidate c = new Candidate();
                c.setUsername(u.getUsername());
                c.setEmail(u.getEmail());
                // build fullName if available
                String fn = (u.getFirstName() == null ? "" : u.getFirstName().trim());
                String ln = (u.getLastName() == null ? "" : u.getLastName().trim());
                String full = (fn + " " + ln).trim();
                if (!full.isEmpty()) c.setFullName(full);
                c.setPhone(u.getPhone());
                c.setProfileComplete(false);
                candidateRepo.save(c);
            }
        }

        return ResponseEntity.ok(Map.of(
                "message", "Registered successfully",
                "username", u.getUsername(),
                "role", role.getName()
        ));
    }

    // Login (updated to include profileComplete flag when a Candidate exists)
   // Login (updated to include profileComplete flag when a Candidate exists)
@PostMapping("/login")
public ResponseEntity<?> login(@Valid @RequestBody AuthRequest req) {
    try {
        // Attempt authentication (this will call the configured UserDetailsService)
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

        // load user so we can read roles and candidate profile
        // Accept username OR email for post-auth lookup (in case the client submitted email).
        Optional<User> userOpt = userRepo.findByUsername(req.getUsername());
        if (userOpt.isEmpty()) {
            userOpt = userRepo.findByEmail(req.getUsername());
        }

        String roleName = "ROLE_USER";
        boolean profileComplete = false;
        List<String> rolesForToken = new ArrayList<>();

        if (userOpt.isPresent()) {
            User u = userOpt.get();
            if (u.getRoles() != null && !u.getRoles().isEmpty()) {
                // pick first role name for quick UI hint
                roleName = u.getRoles().iterator().next().getName();
                // build a list for token generation WITHOUT the ROLE_ prefix
                rolesForToken = u.getRoles().stream()
                        .map(Role::getName)
                        .map(rn -> rn == null ? "" : rn.trim())
                        .filter(s -> !s.isEmpty())
                        .map(s -> s.replaceFirst("(?i)^ROLE_", "")) // remove leading ROLE_ if present
                        .map(String::toUpperCase)
                        .collect(Collectors.toList());
            }

            // If there is a Candidate record for this username, read profileComplete
            Optional<Candidate> cOpt = candidateRepo.findByUsername(u.getUsername());
            if (cOpt.isPresent()) {
                profileComplete = cOpt.get().isProfileComplete();
            }
        }

        // generate token including roles (rolesForToken may be empty list)
        String token = jwtUtil.generateToken(req.getUsername(), rolesForToken);

        // Return token, username, role and profileComplete so frontend can route accordingly
        return ResponseEntity.ok(Map.of(
                "token", token,
                "username", req.getUsername(),
                "role", roleName,
                "roles", rolesForToken,
                "profileComplete", profileComplete
        ));
    } catch (BadCredentialsException ex) {
        return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
    } catch (AuthenticationException ex) {
        return ResponseEntity.status(401).body(Map.of("message", "Authentication failed"));
    }
}

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPasswordByUsername(@RequestBody ResetByUsernameRequest req) {
        if (req == null || req.getUsername() == null || req.getUsername().isBlank()
                || req.getNewPassword() == null || req.getNewPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username and new password are required"));
        }

        Optional<User> uOpt = userRepo.findByUsername(req.getUsername());
        if (uOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        User user = uOpt.get();
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepo.save(user);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

}
