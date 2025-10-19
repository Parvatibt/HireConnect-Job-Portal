package com.example.springapp.dto;

public class UserAdminDto {
    private Long id;
    private String username;
    private String fullName;
    private String primaryRole;

    public UserAdminDto() {}

    public UserAdminDto(Long id, String username, String fullName, String primaryRole) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.primaryRole = primaryRole;
    }

    // getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPrimaryRole() { return primaryRole; }
    public void setPrimaryRole(String primaryRole) { this.primaryRole = primaryRole; }
}
