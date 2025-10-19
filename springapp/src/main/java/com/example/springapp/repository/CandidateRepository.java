package com.example.springapp.repository;

import com.example.springapp.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByUsername(String username);
    Optional<Candidate> findByEmail(String email);
}
