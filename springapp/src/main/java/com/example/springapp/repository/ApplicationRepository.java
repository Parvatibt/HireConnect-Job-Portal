package com.example.springapp.repository;

import com.example.springapp.model.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Page<Application> findByCandidateId(Long candidateId, Pageable pageable);

    @Query("SELECT a FROM Application a WHERE a.job.postedBy.id = :recruiterId")
    Page<Application> findByJobPostedById(Long recruiterId, Pageable pageable);

    Page<Application> findByStatus(String status, Pageable pageable);

    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);
}
