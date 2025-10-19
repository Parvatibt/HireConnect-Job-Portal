package com.example.springapp.repository;

import com.example.springapp.model.Application;
import com.example.springapp.model.Recruiter;
import com.example.springapp.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository for Application entity.
 *
 * Provides both JPA-derived and native helpers. Native methods are used to
 * reliably remove rows by the physical candidate_id column (DB FK).
 */
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByJobId(Long jobId);
    List<Application> findAllByJob_Recruiter(Recruiter recruiter);
    List<Application> findByCandidateId(Long candidateId);
    List<Application> findByCandidate_Id(Long candidateId);
    List<Application> findAllByCandidate_Username(String username);
    List<Application> findAllByCandidate_Email(String email);
    List<Application> findAllByJob_Recruiter_Id(Long recruiterId);
    boolean existsByJob_IdAndCandidate_Id(Long jobId, Long candidateId);

    long countByCandidate_Id(Long candidateId);

    @Transactional
    void deleteAllByCandidate_Id(Long candidateId);

    // Native helpers (reliable even if JPA mapping differs from DB)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM applications WHERE candidate_id = :id", nativeQuery = true)
    void deleteAllByCandidateIdNative(@Param("id") Long id);

    @Query(value = "SELECT COUNT(*) FROM applications WHERE candidate_id = :id", nativeQuery = true)
    long countByCandidateIdNative(@Param("id") Long id);
}
