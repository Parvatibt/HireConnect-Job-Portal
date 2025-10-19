package com.example.springapp.dto;

import java.io.Serializable;
import java.util.Objects;

/**
 * DTO used by recruiter endpoints (/api/recruiters/me).
 *
 * Extended with:
 *  - companyId: numeric id of the linked company (optional)
 *  - company: lightweight holder for nested company object (kept as Object to avoid tight coupling;
 *             replace with your Company DTO class if available)
 *
 * This DTO matches usage in the various service implementations which may set companyId/company.
 */
public class RecruiterProfileDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String fullName;
    private String phone;
    private String email;
    private String hiringFor;
    private String companyName;
    private String location;

    // Added fields required by service mapping
    private Long companyId;
    private Object company;

    public RecruiterProfileDTO() {}

    public RecruiterProfileDTO(Long id, String fullName, String phone, String email,
                               String hiringFor, String companyName, String location) {
        this.id = id;
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.hiringFor = hiringFor;
        this.companyName = companyName;
        this.location = location;
    }

    // --- getters / setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getHiringFor() { return hiringFor; }
    public void setHiringFor(String hiringFor) { this.hiringFor = hiringFor; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public Object getCompany() { return company; }
    public void setCompany(Object company) { this.company = company; }

    // equals/hashCode/toString for convenience

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        RecruiterProfileDTO that = (RecruiterProfileDTO) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() { return id != null ? id.hashCode() : 0; }

    @Override
    public String toString() {
        return "RecruiterProfileDTO{" +
                "id=" + id +
                ", fullName='" + fullName + '\'' +
                ", phone='" + phone + '\'' +
                ", email='" + email + '\'' +
                ", hiringFor='" + hiringFor + '\'' +
                ", companyName='" + companyName + '\'' +
                ", location='" + location + '\'' +
                ", companyId=" + companyId +
                ", company=" + (company != null ? company.getClass().getSimpleName() : "null") +
                '}';
    }
}
