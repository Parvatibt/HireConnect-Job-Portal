package com.example.springapp.controller;

import com.example.springapp.dto.ApplicantItemDTO;
import com.example.springapp.dto.JobDTO;
import com.example.springapp.dto.RecruiterProfileDTO;
import com.example.springapp.service.RecruiterService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recruiters")
public class RecruiterController {

    private final RecruiterService recruiterService;

    public RecruiterController(RecruiterService recruiterService) {
        this.recruiterService = recruiterService;
    }

    // Profile
    @GetMapping("/me")
    public RecruiterProfileDTO me(Principal principal) {
        return recruiterService.getMe(principal);
    }

    @PostMapping("/me")
    public RecruiterProfileDTO saveMe(Principal principal, @RequestBody RecruiterProfileDTO dto) {
        return recruiterService.saveMe(principal, dto);
    }

    // Applicants across my jobs
    @GetMapping("/applicants")
    public List<ApplicantItemDTO> applicants(Principal principal) {
        return recruiterService.listApplicants(principal);
    }

    // Update application status
    @PostMapping("/applications/{id}/status")
    public Map<String, String> updateStatus(@PathVariable("id") Long appId,
                                            @RequestBody Map<String, String> body,
                                            Principal principal) {
        String status = body.getOrDefault("status", "PENDING");
        recruiterService.updateApplicationStatus(appId, status, principal);
        // Java 8 safe: use Collections.singletonMap instead of Map.of
        return Collections.singletonMap("message", "ok");
    }

    // Jobs
    @PostMapping("/jobs")
    public JobDTO postJob(Principal principal, @RequestBody JobDTO dto) {
        return recruiterService.createJob(principal, dto);
    }

    @GetMapping("/jobs")
    public List<JobDTO> myJobs(Principal principal) {
        return recruiterService.listMyJobs(principal);
    }
}
