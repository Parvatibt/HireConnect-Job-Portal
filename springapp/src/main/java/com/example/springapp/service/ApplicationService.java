package com.example.springapp.service;

import com.example.springapp.dto.ApplicationDTO;
import com.example.springapp.dto.CreateApplicationRequest;
import com.example.springapp.exceptions.ResourceNotFoundException;
import com.example.springapp.model.Application;
import com.example.springapp.model.Job;
import com.example.springapp.model.User;
import com.example.springapp.repository.ApplicationRepository;
import com.example.springapp.repository.JobRepository;
import com.example.springapp.repository.UserRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApplicationService {

    private final ApplicationRepository appRepo;
    private final JobRepository jobRepo;
    private final UserRepository userRepo;

    public ApplicationService(ApplicationRepository appRepo, JobRepository jobRepo, UserRepository userRepo) {
        this.appRepo = appRepo;
        this.jobRepo = jobRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public ApplicationDTO apply(CreateApplicationRequest req, String candidateUsername) {
        Job job = jobRepo.findById(req.getJobId()).orElseThrow(() -> new ResourceNotFoundException("Job not found: " + req.getJobId()));
        User candidate = userRepo.findByUsername(candidateUsername).orElseThrow(() -> new ResourceNotFoundException("User not found: " + candidateUsername));

        if (appRepo.existsByJobIdAndCandidateId(job.getId(), candidate.getId())) {
            throw new IllegalStateException("Already applied for this job");
        }

        Application a = new Application();
        a.setJob(job);
        a.setCandidate(candidate);
        a.setResumeUrl(req.getResumeUrl());
        a.setCoverLetter(req.getCoverLetter());
        a.setAppliedAt(java.time.LocalDateTime.now());
        a.setStatus("SUBMITTED");

        Application saved = appRepo.save(a);
        return toDto(saved);
    }

    public Page<ApplicationDTO> getForCandidate(Long candidateId, int page, int size) {
        Pageable p = PageRequest.of(page, size);
        return appRepo.findByCandidateId(candidateId, p).map(this::toDto);
    }

    public Page<ApplicationDTO> getForRecruiter(Long recruiterId, int page, int size) {
        Pageable p = PageRequest.of(page, size);
        return appRepo.findByJobPostedById(recruiterId, p).map(this::toDto);
    }

    @Transactional
    public void updateStatus(Long applicationId, String status) {
        Application a = appRepo.findById(applicationId).orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));
        a.setStatus(status);
        appRepo.save(a);
    }

    public ApplicationDTO getById(Long id) {
        return appRepo.findById(id).map(this::toDto).orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
    }

    private ApplicationDTO toDto(Application a) {
        ApplicationDTO dto = new ApplicationDTO();
        dto.setId(a.getId());
        dto.setJobId(a.getJob() != null ? a.getJob().getId() : null);
        dto.setJobTitle(a.getJob() != null ? a.getJob().getTitle() : null);
        dto.setCandidateId(a.getCandidate() != null ? a.getCandidate().getId() : null);
        dto.setCandidateUsername(a.getCandidate() != null ? a.getCandidate().getUsername() : null);
        dto.setAppliedAt(a.getAppliedAt());
        dto.setStatus(a.getStatus());
        dto.setResumeUrl(a.getResumeUrl());
        dto.setCoverLetter(a.getCoverLetter());
        return dto;
    }
}
