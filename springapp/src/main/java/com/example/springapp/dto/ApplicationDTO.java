package com.example.springapp.dto;

public class ApplicationDTO {
    public Long id;
    public Long jobId;
    public String candidateName;
    public String candidateEmail;
    public String candidatePhone;
    public String coverLetter;
    public String resumeFilename;

    public ApplicationDTO() {}

    public ApplicationDTO(Long id, Long jobId, String candidateName, String candidateEmail,
                          String candidatePhone, String coverLetter, String resumeFilename) {
        this.id = id;
        this.jobId = jobId;
        this.candidateName = candidateName;
        this.candidateEmail = candidateEmail;
        this.candidatePhone = candidatePhone;
        this.coverLetter = coverLetter;
        this.resumeFilename = resumeFilename;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public String getCandidatePhone() { return candidatePhone; }
    public void setCandidatePhone(String candidatePhone) { this.candidatePhone = candidatePhone; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public String getResumeFilename() { return resumeFilename; }
    public void setResumeFilename(String resumeFilename) { this.resumeFilename = resumeFilename; }
}
