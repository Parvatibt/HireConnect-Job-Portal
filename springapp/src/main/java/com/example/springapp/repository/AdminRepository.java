package com.example.springapp.repository;

import com.example.springapp.model.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin, Long> {} // optional

