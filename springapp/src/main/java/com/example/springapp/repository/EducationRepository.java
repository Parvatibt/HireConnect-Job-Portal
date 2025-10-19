package com.example.springapp.repository;

import com.example.springapp.model.Candidate;
import com.example.springapp.model.Education;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findByCandidate(Candidate candidate);
    void deleteByCandidate(Candidate candidate);   // ✅ used to “replace all”
}
