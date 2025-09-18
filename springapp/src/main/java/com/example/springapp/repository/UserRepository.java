package com.example.springapp.repository;

import com.example.springapp.model.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ✅ Find user by username
    Optional<User> findByUsername(String username);

    // ✅ Find user by email (fix for AuthController)
    Optional<User> findByEmail(String email);

    // ✅ Check if username already exists
    boolean existsByUsername(String username);

    // ✅ Check if email already exists
    boolean existsByEmail(String email);

    // ✅ Page all users for admin with search by firstName, lastName, or username
    @Query("SELECT u FROM User u " +
           "WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<User> searchUsers(String q, Pageable pageable);
}
