package com.example.springapp.service;

import com.example.springapp.model.Role;
import com.example.springapp.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RoleService {
    private final RoleRepository roleRepo;

    public RoleService(RoleRepository roleRepo) {
        this.roleRepo = roleRepo;
    }

    public Optional<Role> findByName(String name) {
        return roleRepo.findByName(name);
    }
}
