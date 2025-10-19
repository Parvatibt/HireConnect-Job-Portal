// src/main/java/com/example/springapp/controller/JobController.java
package com.example.springapp.controller;

import com.example.springapp.dto.JobDTO;
import com.example.springapp.service.JobService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private static final Logger logger = LoggerFactory.getLogger(JobController.class);
    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    /** 🔹 Used by landing page — fail-soft to empty list on error */
    @GetMapping
    public List<JobDTO> getAllJobs() {
        try {
            return jobService.getAllJobs();
        } catch (Throwable t) {
            logger.error("GET /api/jobs failed: {}", t.toString(), t);
            return List.of();
        }
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMyJobs(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String username = principal.getName();
        return ResponseEntity.ok(jobService.getJobsByRecruiter(username));
    }

    @GetMapping("/{id:\\d+}")
    public JobDTO getJobById(@PathVariable Long id) {
        return jobService.getJobById(id);
    }

    @PostMapping
    public ResponseEntity<JobDTO> createJob(@RequestBody JobDTO dto,
                                            HttpServletRequest req,
                                            Principal principal) {
        logger.info("POST /api/jobs from IP={} authHeaderPresent={}",
                req.getRemoteAddr(), req.getHeader("Authorization") != null);
        String username = (principal != null) ? principal.getName() : null;
        JobDTO created = jobService.createJob(dto, username);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobDTO> updateJob(@PathVariable Long id,
                                            @RequestBody JobDTO dto,
                                            Principal principal) {
        String username = (principal != null) ? principal.getName() : null;
        JobDTO updated = jobService.updateJob(id, dto, username);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id,
                                          Principal principal) {
        String username = (principal != null) ? principal.getName() : null;
        jobService.deleteJob(id, username);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/debug/auth")
    public ResponseEntity<Map<String, Object>> debugAuth(Principal principal) {
        Map<String, Object> out = new HashMap<>();
        if (principal == null) {
            out.put("authenticated", false);
            out.put("principal", null);
            out.put("authorities", null);
            return ResponseEntity.ok(out);
        }
        out.put("authenticated", true);
        out.put("principal", principal.getName());
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();
            if (auth != null) {
                out.put("authorities", auth.getAuthorities()
                        .stream().map(a -> a.getAuthority()).toList());
            } else {
                out.put("authorities", List.of());
            }
        } catch (Exception ex) {
            out.put("authorities", "error reading authorities: " + ex.toString());
        }
        return ResponseEntity.ok(out);
    }
}
