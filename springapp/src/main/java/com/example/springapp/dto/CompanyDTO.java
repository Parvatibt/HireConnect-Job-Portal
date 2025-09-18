package com.example.springapp.dto;

public class CompanyDTO {
    private Long id;
    private String name;
    private String description;
    private String logoUrl;
    private String status;
    private Long jobsCount;

    public CompanyDTO() {}

    // getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getJobsCount() { return jobsCount; }
    public void setJobsCount(Long jobsCount) { this.jobsCount = jobsCount; }
}
