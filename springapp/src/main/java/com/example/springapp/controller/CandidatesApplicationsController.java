package com.example.springapp.controller;

import com.example.springapp.dto.ApplicantItemDTO;
import com.example.springapp.model.Application;
import com.example.springapp.model.Candidate;
import com.example.springapp.repository.ApplicationRepository;
import com.example.springapp.repository.CandidateRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
// This maps to: /api/candidates/...
// So the full path below becomes: /api/candidates/me/applications
@org.springframework.web.bind.annotation.RequestMapping("/api/candidates")
public class CandidatesApplicationsController {

    private final ApplicationRepository applicationRepo;
    private final CandidateRepository candidateRepo;

    public CandidatesApplicationsController(ApplicationRepository applicationRepo,
                                            CandidateRepository candidateRepo) {
        this.applicationRepo = applicationRepo;
        this.candidateRepo = candidateRepo;
    }

    @GetMapping("/me/applications")
    public ResponseEntity<?> myApplicationsAlias(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String sub = principal.getName();
        Optional<Candidate> cOpt = candidateRepo.findByUsername(sub);
        if (cOpt.isEmpty()) cOpt = candidateRepo.findByEmail(sub);

        if (cOpt.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        Candidate cand = cOpt.get();
        List<Application> apps = applicationRepo.findByCandidateId(cand.getId());

        List<ApplicantItemDTO> out = apps.stream().map(a -> {
            Long jobId = a.getJob() != null ? a.getJob().getId() : null;
            String jobTitle = a.getJob() != null ? a.getJob().getTitle() : null;
            String companyName = (a.getJob() != null && a.getJob().getCompany() != null)
                    ? a.getJob().getCompany().getName() : null;
            String resumeUrl = a.getResumeFilename() != null ? "/api/applications/resumes/" + a.getResumeFilename() : null;
            Instant appliedAt = a.getCreatedAt();
            return new ApplicantItemDTO(
                    a.getId(),
                    jobId,
                    jobTitle,
                    a.getCandidateName(),
                    a.getCandidateEmail(),
                    resumeUrl,
                    appliedAt,
                    a.getStatus()
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(out);
    }
}
