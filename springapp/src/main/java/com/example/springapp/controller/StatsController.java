// src/main/java/com/example/springapp/controller/StatsController.java
package com.example.springapp.controller;

import com.example.springapp.repository.CompanyRepository;
import com.example.springapp.repository.JobRepository;
import com.example.springapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final JobRepository jobRepo;
    private final CompanyRepository companyRepo;
    private final UserRepository userRepo;

    public StatsController(JobRepository jobRepo,
                           CompanyRepository companyRepo,
                           UserRepository userRepo) {
        this.jobRepo = jobRepo;
        this.companyRepo = companyRepo;
        this.userRepo = userRepo;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> overview() {
        try {
            // No status column in Job -> just use total counts
            long activeJobs  = jobRepo.count();
            long companies   = companyRepo.count();
            long jobSeekers  = userRepo.count();

            // Placeholder – adjust if you later compute a real value
            int successRate = 95;

            return ResponseEntity.ok(Map.of(
                    "activeJobs", activeJobs,
                    "companies", companies,
                    "jobSeekers", jobSeekers,
                    "successRate", successRate
            ));
        } catch (Throwable t) {
            // Fail-soft so the landing page still renders
            return ResponseEntity.ok(Map.of(
                    "activeJobs", 0,
                    "companies", 0,
                    "jobSeekers", 0,
                    "successRate", 0
            ));
        }
    }
}
