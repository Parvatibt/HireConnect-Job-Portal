package com.example.springapp.controller;

import com.example.springapp.dto.UserAdminDto;
import com.example.springapp.model.User;
import com.example.springapp.service.UserService;
import com.example.springapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;
    private final UserService userService;

    public AdminUserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    /**
     * Return a list of users for the admin UI.
     * Example result: [{ id:1, username: "admin", fullName: "System Admin", primaryRole: "ROLE_ADMIN" }, ...]
     */
    @GetMapping
    public ResponseEntity<List<UserAdminDto>> listUsers() {
        List<User> users = userService.findAll();
        List<UserAdminDto> dtos = users.stream().map(u -> {
            String fn = u.getFirstName() == null ? "" : u.getFirstName().trim();
            String ln = u.getLastName() == null ? "" : u.getLastName().trim();
            String full = (fn + " " + ln).trim();
            if (full.isEmpty()) full = u.getUsername();

            // pick a primary role name if available
            String primaryRole = null;
            if (u.getRoles() != null && !u.getRoles().isEmpty()) {
                // take first role
                primaryRole = u.getRoles().iterator().next().getName();
            }

            return new UserAdminDto(u.getId(), u.getUsername(), full, primaryRole);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    /**
     * Delete user (optional).
     * Only use when you want delete support in admin UI.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        // optional: verify admin cannot delete self, etc.
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
