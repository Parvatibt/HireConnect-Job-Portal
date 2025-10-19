package com.example.springapp.dto;

public class ResetByUsernameRequest {
    private String username;
    private String newPassword;
    private String currentPassword; // optional

    public ResetByUsernameRequest() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
}
