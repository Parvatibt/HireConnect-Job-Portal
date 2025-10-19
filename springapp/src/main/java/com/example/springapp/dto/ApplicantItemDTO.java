package com.example.springapp.dto;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * DTO returned to recruiter frontend listing applicants.
 * Uses Instant for appliedAt to match service conversion.
 * Includes helper logic to ensure resumeUrl is well-formed (/files/resumes/{filename}).
 */
public class ApplicantItemDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;              // application id
    private Long jobId;
    private String jobTitle;
    private String candidateName;
    private String candidateEmail;
    private String resumeUrl;
    private Instant appliedAt;
    private String status;

    public ApplicantItemDTO() {}

    public ApplicantItemDTO(Long id, Long jobId, String jobTitle,
                            String candidateName, String candidateEmail,
                            String resumeUrl, Instant appliedAt, String status) {
        this.id = id;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.candidateName = candidateName;
        this.candidateEmail = candidateEmail;
        setResumeUrl(resumeUrl); // use setter to normalize URL
        this.appliedAt = appliedAt;
        this.status = status;
    }

    // --- getters / setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public String getResumeUrl() { return resumeUrl; }

    /**
     * Normalizes and stores resume URL.
     * If given only a filename, it automatically prefixes "/files/resumes/".
     */
    public void setResumeUrl(String resumeUrl) {
        if (resumeUrl == null || resumeUrl.isBlank()) {
            this.resumeUrl = null;
        } else if (!resumeUrl.startsWith("/") && !resumeUrl.startsWith("http")) {
            this.resumeUrl = "/files/resumes/" + resumeUrl;
        } else {
            this.resumeUrl = resumeUrl;
        }
    }

    public Instant getAppliedAt() { return appliedAt; }
    public void setAppliedAt(Instant appliedAt) { this.appliedAt = appliedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // --- helper ---

    /**
     * Build a public resume URL from stored filename.
     * (e.g. "abc.pdf" -> "/files/resumes/abc.pdf")
     */
    public static String buildResumeUrl(String filename) {
        if (filename == null || filename.isBlank()) return null;
        if (filename.startsWith("/") || filename.startsWith("http")) return filename;
        return "/files/resumes/" + filename;
    }

    // --- equals, hashCode, toString ---

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ApplicantItemDTO that = (ApplicantItemDTO) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() { return id != null ? id.hashCode() : 0; }

    @Override
    public String toString() {
        return "ApplicantItemDTO{" +
                "id=" + id +
                ", jobId=" + jobId +
                ", jobTitle='" + jobTitle + '\'' +
                ", candidateName='" + candidateName + '\'' +
                ", candidateEmail='" + candidateEmail + '\'' +
                ", resumeUrl='" + resumeUrl + '\'' +
                ", appliedAt=" + appliedAt +
                ", status='" + status + '\'' +
                '}';
    }
}
