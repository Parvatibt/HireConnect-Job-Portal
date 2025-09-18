package com.example.springapp.repository;

import com.example.springapp.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param; // ✅ add this import
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    Page<Job> findByIsActiveTrue(Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.isActive = true AND " +
           "(LOWER(j.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(j.location) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Job> searchActiveJobs(@Param("q") String q, Pageable pageable);

    List<Job> findByCompanyId(Long companyId);

    Page<Job> findByCompanyId(Long companyId, Pageable pageable);
}
