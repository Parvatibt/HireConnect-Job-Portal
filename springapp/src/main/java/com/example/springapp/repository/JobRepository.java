// src/main/java/com/example/springapp/repository/JobRepository.java
package com.example.springapp.repository;

import com.example.springapp.model.Job;
import com.example.springapp.model.Recruiter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByRecruiter(Recruiter recruiter);
    List<Job> findByRecruiterId(Long recruiterId);
   

    // ✅ Fetch join to load company and recruiter eagerly
    @Query("SELECT j FROM Job j JOIN FETCH j.company c JOIN FETCH j.recruiter r")
    List<Job> findAllWithCompanyAndRecruiter();
    
   
}
