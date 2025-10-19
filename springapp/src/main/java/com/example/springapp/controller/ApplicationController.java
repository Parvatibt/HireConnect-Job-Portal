package com.example.springapp.controller;

import com.example.springapp.dto.ApplicationDTO;
import com.example.springapp.dto.ApplicantItemDTO;
import com.example.springapp.model.Application;
import com.example.springapp.model.Candidate;
import com.example.springapp.model.Job;
import com.example.springapp.model.Recruiter;
import com.example.springapp.repository.ApplicationRepository;
import com.example.springapp.repository.CandidateRepository;
import com.example.springapp.repository.JobRepository;
import com.example.springapp.repository.RecruiterRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.nio.file.*;
import java.security.Principal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationRepository applicationRepo;
    private final JobRepository jobRepo;
    private final CandidateRepository candidateRepo;
    private final RecruiterRepository recruiterRepo;

    // upload directory (relative to working dir)
    private final Path uploadDir = Paths.get("uploads", "resumes");

    public ApplicationController(ApplicationRepository applicationRepo,
                                 JobRepository jobRepo,
                                 CandidateRepository candidateRepo,
                                 RecruiterRepository recruiterRepo) {
        this.applicationRepo = applicationRepo;
        this.jobRepo = jobRepo;
        this.candidateRepo = candidateRepo;
        this.recruiterRepo = recruiterRepo;

        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }
    }

    /* ---------------------------
       Candidate endpoints
       --------------------------- */

    @PostMapping
    public ResponseEntity<?> createApplication(@RequestBody ApplicationDTO dto, Principal principal) {
        if (dto == null || dto.getJobId() == null) {
            return ResponseEntity.badRequest().body("Missing jobId");
        }

        Job job = jobRepo.findById(dto.getJobId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job not found"));

        Application a = new Application();
        a.setJob(job);
        a.setCandidateName(dto.getCandidateName());
        a.setCandidateEmail(dto.getCandidateEmail());
        a.setCandidatePhone(dto.getCandidatePhone());
        a.setCoverLetter(dto.getCoverLetter());
        a.setResumeFilename(dto.getResumeFilename());
        a.setCreatedAt(Instant.now());
        a.setStatus("PENDING");

        if (principal != null) {
            String sub = principal.getName();
            Optional<Candidate> cOpt = candidateRepo.findByUsername(sub);
            if (cOpt.isEmpty()) cOpt = candidateRepo.findByEmail(sub);
            cOpt.ifPresent(a::setCandidate);
        }

        Application saved = applicationRepo.save(a);
        ApplicationDTO out = new ApplicationDTO(
                saved.getId(),
                saved.getJob() != null ? saved.getJob().getId() : null,
                saved.getCandidateName(),
                saved.getCandidateEmail(),
                saved.getCandidatePhone(),
                saved.getCoverLetter(),
                saved.getResumeFilename()
        );
        return ResponseEntity.ok(out);
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyWithFile(
            @RequestParam("jobId") Long jobId,
            @RequestParam("candidateName") String candidateName,
            @RequestParam("candidateEmail") String candidateEmail,
            @RequestParam(value = "candidatePhone", required = false) String candidatePhone,
            @RequestParam("file") MultipartFile file,
            Principal principal) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("Resume file is required.");
        }

        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job not found"));

        String originalName = Optional.ofNullable(file.getOriginalFilename()).orElse("resume");
        String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.')) : "";
        String newFilename = UUID.randomUUID().toString() + ext;

        try {
            Path dest = uploadDir.resolve(newFilename).normalize();
            if (!dest.startsWith(uploadDir)) {
                return ResponseEntity.badRequest().body("Invalid file path");
            }
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to save resume file: " + e.getMessage());
        }

        Application a = new Application();
        a.setJob(job);
        a.setCandidateName(candidateName);
        a.setCandidateEmail(candidateEmail);
        a.setCandidatePhone(candidatePhone);
        a.setResumeFilename(newFilename);
        a.setCreatedAt(Instant.now());
        a.setStatus("PENDING");

        if (principal != null) {
            String sub = principal.getName();
            Optional<Candidate> cOpt = candidateRepo.findByUsername(sub);
            if (cOpt.isEmpty()) cOpt = candidateRepo.findByEmail(sub);
            cOpt.ifPresent(a::setCandidate);
        }

        Application saved = applicationRepo.save(a);

        ApplicationDTO out = new ApplicationDTO(
                saved.getId(),
                saved.getJob().getId(),
                saved.getCandidateName(),
                saved.getCandidateEmail(),
                saved.getCandidatePhone(),
                saved.getCoverLetter(),
                saved.getResumeFilename()
        );

        Map<String, Object> res = new HashMap<>();
        res.put("application", out);
        res.put("resumeUrl", "/api/applications/resumes/" + saved.getResumeFilename());

        return ResponseEntity.ok(res);
    }

    @GetMapping("/resumes/{filename:.+}")
    public ResponseEntity<?> getResume(@PathVariable String filename) {
        Path filePath = uploadDir.resolve(filename).normalize();
        if (!Files.exists(filePath) || !filePath.startsWith(uploadDir)) {
            return ResponseEntity.notFound().build();
        }

        try {
            byte[] data = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(data);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to read resume file.");
        }
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMyApplications(Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        String sub = principal.getName();
        Optional<Candidate> cOpt = candidateRepo.findByUsername(sub);
        if (cOpt.isEmpty()) cOpt = candidateRepo.findByEmail(sub);
        if (cOpt.isEmpty()) return ResponseEntity.ok(Collections.emptyList());

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

    /* ---------------------------
       New: recruiter endpoint
       --------------------------- */

    /**
     * GET /api/applications/recruiter
     * Returns all applications for jobs posted by the authenticated recruiter.
     */
    @GetMapping("/recruiter")
    public ResponseEntity<?> getApplicationsForRecruiter(Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        String sub = principal.getName();
        Optional<Recruiter> rOpt = recruiterRepo.findByUsername(sub);
        if (rOpt.isEmpty()) rOpt = recruiterRepo.findByEmail(sub);
        if (rOpt.isEmpty()) return ResponseEntity.ok(Collections.emptyList());

        Recruiter recruiter = rOpt.get();

        // fetch by property traversal — repository must implement findAllByJob_Recruiter
        List<Application> apps = applicationRepo.findAllByJob_Recruiter(recruiter);

        List<ApplicantItemDTO> out = apps.stream().map(a -> {
            Long jobId = a.getJob() != null ? a.getJob().getId() : null;
            String jobTitle = a.getJob() != null ? a.getJob().getTitle() : null;
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

    /* ---------------------------
       Recruiter can update status for an application (only if their job)
       --------------------------- */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable("id") Long applicationId,
                                          @RequestBody Map<String, String> body,
                                          Principal principal) {
        String newStatus = body != null ? body.get("status") : null;
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body("status is required");
        }

        Application app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        Job job = app.getJob();
        if (job == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Application has no associated job");
        }

        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        String principalName = principal.getName();
        Recruiter jobRecruiter = job.getRecruiter();

        boolean allowed = false;
        if (jobRecruiter != null) {
            if (jobRecruiter.getUsername() != null && jobRecruiter.getUsername().equals(principalName)) {
                allowed = true;
            } else if (jobRecruiter.getEmail() != null && jobRecruiter.getEmail().equals(principalName)) {
                allowed = true;
            } else {
                Optional<Recruiter> rOpt = recruiterRepo.findByUsername(principalName);
                if (rOpt.isPresent() && jobRecruiter.getId() != null && rOpt.get().getId().equals(jobRecruiter.getId())) {
                    allowed = true;
                }
            }
        }

        if (!allowed) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not allowed to change status for this application");

        app.setStatus(newStatus.trim().toUpperCase());
        applicationRepo.save(app);

        ApplicantItemDTO dto = new ApplicantItemDTO(
                app.getId(),
                job.getId(),
                job.getTitle(),
                app.getCandidateName(),
                app.getCandidateEmail(),
                app.getResumeFilename() != null ? "/api/applications/resumes/" + app.getResumeFilename() : null,
                app.getCreatedAt(),
                app.getStatus()
        );

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        Optional<Application> opt = applicationRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Application a = opt.get();
        ApplicationDTO out = new ApplicationDTO(
                a.getId(),
                a.getJob() != null ? a.getJob().getId() : null,
                a.getCandidateName(),
                a.getCandidateEmail(),
                a.getCandidatePhone(),
                a.getCoverLetter(),
                a.getResumeFilename()
        );
        return ResponseEntity.ok(out);
    }

    // =============================================
// 🔹 Check if current candidate has applied for a job
// =============================================

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> hasAppliedForJob(
            @RequestParam("jobId") Long jobId,
            Principal principal
    ) {
        Map<String, Boolean> result = new HashMap<>();
        result.put("applied", false);

        if (principal == null || jobId == null) {
            return ResponseEntity.ok(result);
        }

        // find candidate by username or email
        String usernameOrEmail = principal.getName();
        var candidateOpt = candidateRepo.findByUsername(usernameOrEmail);
        if (candidateOpt.isEmpty()) candidateOpt = candidateRepo.findByEmail(usernameOrEmail);
        if (candidateOpt.isEmpty()) {
            return ResponseEntity.ok(result);
        }

        Long candidateId = candidateOpt.get().getId();

        // check if record exists
        boolean applied = applicationRepo.existsByJob_IdAndCandidate_Id(jobId, candidateId);
        result.put("applied", applied);

        return ResponseEntity.ok(result);
    }


}
