package com.example.springapp.dto;

import jakarta.validation.constraints.NotNull;

public class CreateApplicationRequest {

    @NotNull
    private Long jobId;

    private String resumeUrl;
    private String coverLetter;

    public CreateApplicationRequest() {}

    // getters / setters
    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
}
