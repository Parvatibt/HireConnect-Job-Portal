package com.example.springapp.dto;

import java.time.LocalDateTime;

public class JobDTO {
    private Long id;
    private String title;
    private String description;
    private String location;
    private String employmentType;
    private boolean isActive;
    private LocalDateTime postedAt;
    private Long companyId;
    private String companyName;
    private Long postedById;
    private String postedByUsername;

    public JobDTO() {}

    // getters / setters
    // (Generate in IDE; omitted here for brevity)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getPostedAt() { return postedAt; }
    public void setPostedAt(LocalDateTime postedAt) { this.postedAt = postedAt; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public Long getPostedById() { return postedById; }
    public void setPostedById(Long postedById) { this.postedById = postedById; }

    public String getPostedByUsername() { return postedByUsername; }
    public void setPostedByUsername(String postedByUsername) { this.postedByUsername = postedByUsername; }
}
