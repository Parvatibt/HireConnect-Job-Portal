package com.example.springapp.dto;

import java.io.Serializable;
import java.util.List;
import java.util.Objects;

/**
 * Data Transfer Object for Job entity. Lightweight and safe for JSON serialization.
 * postedAt is represented as an ISO-8601 string (UTC) for frontend consumption.
 */
public class JobDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String title;
    private String location;
    private String description;
    private Integer minExp;
    private Integer maxExp;
    private Integer minSalary;
    private Integer maxSalary;
    private List<String> responsibilities;
    private Long companyId;
    private String companyName;
    private String employmentType;
    private String postedAt;     // ISO-8601 string (e.g. Instant.toString())
    private String category;

    // Optional: who posted the job (useful for frontend)
    private Long recruiterId;
    private String recruiterUsername;

    public JobDTO() {}

    public JobDTO(Long id, String title, String location, String description,
                  Integer minExp, Integer maxExp, Integer minSalary, Integer maxSalary) {
        this.id = id;
        this.title = title;
        this.location = location;
        this.description = description;
        this.minExp = minExp;
        this.maxExp = maxExp;
        this.minSalary = minSalary;
        this.maxSalary = maxSalary;
    }

    public JobDTO(Long id, String title, String location, String description,
                  Integer minExp, Integer maxExp, Integer minSalary, Integer maxSalary,
                  List<String> responsibilities, Long companyId, String companyName,
                  String employmentType, String postedAt) {
        this(id, title, location, description, minExp, maxExp, minSalary, maxSalary);
        this.responsibilities = responsibilities;
        this.companyId = companyId;
        this.companyName = companyName;
        this.employmentType = employmentType;
        this.postedAt = postedAt;
    }

    public JobDTO(Long id, String title, String location, String description,
                  Integer minExp, Integer maxExp, Integer minSalary, Integer maxSalary,
                  List<String> responsibilities, Long companyId, String companyName,
                  String employmentType, String postedAt, String category) {
        this(id, title, location, description, minExp, maxExp, minSalary, maxSalary,
                responsibilities, companyId, companyName, employmentType, postedAt);
        this.category = category;
    }
    // Add after category:
    private Boolean isActive;
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    // --- getters / setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getMinExp() { return minExp; }
    public void setMinExp(Integer minExp) { this.minExp = minExp; }

    public Integer getMaxExp() { return maxExp; }
    public void setMaxExp(Integer maxExp) { this.maxExp = maxExp; }

    public Integer getMinSalary() { return minSalary; }
    public void setMinSalary(Integer minSalary) { this.minSalary = minSalary; }

    public Integer getMaxSalary() { return maxSalary; }
    public void setMaxSalary(Integer maxSalary) { this.maxSalary = maxSalary; }

    public List<String> getResponsibilities() { return responsibilities; }
    public void setResponsibilities(List<String> responsibilities) { this.responsibilities = responsibilities; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public String getPostedAt() { return postedAt; }
    public void setPostedAt(String postedAt) { this.postedAt = postedAt; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Long getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Long recruiterId) { this.recruiterId = recruiterId; }

    public String getRecruiterUsername() { return recruiterUsername; }
    public void setRecruiterUsername(String recruiterUsername) { this.recruiterUsername = recruiterUsername; }

    @Override
    public String toString() {
        return "JobDTO{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", location='" + location + '\'' +
                ", description='" + (description != null ? (description.length() > 40 ? description.substring(0,40) + "..." : description) : null) + '\'' +
                ", minExp=" + minExp +
                ", maxExp=" + maxExp +
                ", minSalary=" + minSalary +
                ", maxSalary=" + maxSalary +
                ", responsibilities=" + responsibilities +
                ", companyId=" + companyId +
                ", companyName='" + companyName + '\'' +
                ", employmentType='" + employmentType + '\'' +
                ", postedAt='" + postedAt + '\'' +
                ", category='" + category + '\'' +
                ", recruiterId=" + recruiterId +
                ", recruiterUsername='" + recruiterUsername + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        JobDTO jobDTO = (JobDTO) o;
        return Objects.equals(id, jobDTO.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}
