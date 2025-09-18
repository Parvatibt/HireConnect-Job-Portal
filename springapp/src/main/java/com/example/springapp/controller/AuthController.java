package com.example.springapp.controller;

import com.example.springapp.dto.AuthRequest;
import com.example.springapp.dto.AuthResponse;
import com.example.springapp.model.Role;
import com.example.springapp.model.User;
import com.example.springapp.repository.UserRepository;
import com.example.springapp.service.RoleService;
import com.example.springapp.service.PasswordResetService;
import com.example.springapp.config.JwtUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepo;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final PasswordResetService passwordResetService;

    public AuthController(UserRepository userRepo,
            RoleService roleService,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authManager,
            JwtUtil jwtUtil,
            PasswordResetService passwordResetService) {
        this.userRepo = userRepo;
        this.roleService = roleService;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
        this.passwordResetService = passwordResetService;
    }

    // ✅ Register
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest req) {
        if (req.getUsername() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().body("Username and password required");
        }

        if (userRepo.existsByUsername(req.getUsername())) {
            return ResponseEntity.badRequest().body("Username already taken");
        }
        if (req.getEmail() != null && userRepo.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body("Email already used");
        }

        User u = new User();
        u.setUsername(req.getUsername());
        u.setEmail(req.getEmail());
        u.setPassword(passwordEncoder.encode(req.getPassword()));

        // assign role
        String extra = req.getExtra();
        Role role;
        if ("employer".equalsIgnoreCase(extra)) {
            role = roleService.findByName("ROLE_RECRUITER").orElse(null);
        } else {
            role = roleService.findByName("ROLE_CANDIDATE").orElse(null);
        }
        if (role == null) {
            role = roleService.findByName("ROLE_USER").orElse(null);
        }
        if (role == null) {
            return ResponseEntity.internalServerError().body("Server role configuration missing");
        }

        u.setRoles(Set.of(role));
        userRepo.save(u);

        return ResponseEntity.ok("Registered successfully");
    }

    // ✅ Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest req) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

            String token = jwtUtil.generateToken(req.getUsername());

            Optional<User> userOpt = userRepo.findByUsername(req.getUsername());
            String roleName = "ROLE_USER";
            if (userOpt.isPresent()) {
                User r = userOpt.get();
                if (r.getRoles() != null && !r.getRoles().isEmpty()) {
                    roleName = r.getRoles().iterator().next().getName();
                }
            }

            return ResponseEntity.ok(new AuthResponse(token, req.getUsername(), roleName));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body("Invalid credentials");
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body("Authentication failed");
        }
    }

    // ✅ Forgot password
    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@RequestBody AuthRequest req) {
        if (req.getEmail() == null) {
            return ResponseEntity.badRequest().body("Email required");
        }

        Optional<User> uOpt = userRepo.findByEmail(req.getEmail());
        if (uOpt.isEmpty()) {
            // Don't expose whether email exists
            return ResponseEntity.ok("If the email exists, a reset token was generated");
        }

        User user = uOpt.get();
        String token = passwordResetService.createTokenFor(user);

        // TODO: send token by email (for now return in response for dev)
        return ResponseEntity.ok("Reset token (dev): " + token);
    }

    // ✅ Reset password
    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody AuthRequest req) {
        if (req.getPassword() == null || req.getExtra() == null) {
            return ResponseEntity.badRequest()
                    .body("Token and new password are required (use 'extra' field for token)");
        }

        String token = req.getExtra();
        String newPassword = req.getPassword();

        Optional<User> uOpt = passwordResetService.validateToken(token);
        if (uOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid or expired token");
        }

        User user = uOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        passwordResetService.removeToken(token);

        return ResponseEntity.ok("Password reset successful");
    }
}
