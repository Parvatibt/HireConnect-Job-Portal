package com.example.springapp.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateCompanyRequest {

    @NotBlank
    private String name;

    private String description;
    private String logoUrl;

    public CreateCompanyRequest() {}

    // getters / setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
}
