package com.example.springapp.service;

import com.example.springapp.dto.JobDTO;
import com.example.springapp.model.Job;

public class JobMapper {

    public static JobDTO toDto(Job j) {
        if (j == null) return null;
        JobDTO dto = new JobDTO();
        dto.setId(j.getId());
        dto.setTitle(j.getTitle());
        dto.setDescription(j.getDescription());
        dto.setLocation(j.getLocation());
        dto.setEmploymentType(j.getEmploymentType());
        dto.setActive(j.isActive());
        dto.setPostedAt(j.getPostedAt());

        if (j.getCompany() != null) {
            dto.setCompanyId(j.getCompany().getId());
            dto.setCompanyName(j.getCompany().getName());
        }

        if (j.getPostedBy() != null) {
            dto.setPostedById(j.getPostedBy().getId());
            dto.setPostedByUsername(j.getPostedBy().getUsername());
        }

        return dto;
    }
}
