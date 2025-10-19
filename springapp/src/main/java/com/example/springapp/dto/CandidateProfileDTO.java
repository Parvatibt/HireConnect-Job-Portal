package com.example.springapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfileDTO {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String location;
    private String pinCode;

    // NEW
    private String headline;
    private String skills;

    private String resumeUrl;
    private String resumeFilename;
    private boolean profileComplete;
}
