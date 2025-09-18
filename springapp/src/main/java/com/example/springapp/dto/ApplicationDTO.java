package com.example.springapp.dto;

import java.time.LocalDateTime;

public class ApplicationDTO {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private Long candidateId;
    private String candidateUsername;
    private LocalDateTime appliedAt;
    private String status;
    private String resumeUrl;
    private String coverLetter;

    public ApplicationDTO() {}

    // getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public String getCandidateUsername() { return candidateUsername; }
    public void setCandidateUsername(String candidateUsername) { this.candidateUsername = candidateUsername; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
}
