package com.example.springapp.repository;

import com.example.springapp.model.Recruiter;
import com.example.springapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecruiterRepository extends JpaRepository<Recruiter, Long> {

    Optional<Recruiter> findByUsername(String username);
    Optional<Recruiter> findByEmail(String email);

    /**
     * Look up recruiter by linked User entity.
     * (Used in UserService.unlink logic)
     */
    Optional<Recruiter> findByUser(User user);

    /**
     * Look up recruiter by linked user ID (property traversal: user.id).
     */
    Optional<Recruiter> findByUser_Id(Long userId);
}
