package com.example.springapp.repository;

import com.example.springapp.model.Admin;
import com.example.springapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    // Required by UserService unlink logic
    Optional<Admin> findByUser(User user);

    // Optional convenience: find by linked user id
    Optional<Admin> findByUser_Id(Long userId);
}
