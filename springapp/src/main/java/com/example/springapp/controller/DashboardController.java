package com.example.springapp.controller;

import com.example.springapp.model.User;
import com.example.springapp.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final UserRepository userRepo;

    public DashboardController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/candidates")
    public List<User> getAllCandidates() {
        return userRepo.findAll().stream()
                .filter(user -> user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_CANDIDATE")))
                .collect(Collectors.toList());
    }

    @GetMapping("/recruiters")
    public List<User> getAllRecruiters() {
        return userRepo.findAll().stream()
                .filter(user -> user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_RECRUITER")))
                .collect(Collectors.toList());
    }

    @GetMapping("/admins")
    public List<User> getAllAdmins() {
        return userRepo.findAll().stream()
                .filter(user -> user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN")))
                .collect(Collectors.toList());
    }
}
