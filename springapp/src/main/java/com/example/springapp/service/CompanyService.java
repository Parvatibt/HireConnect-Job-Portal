package com.example.springapp.service;

import com.example.springapp.dto.CompanyDTO;
import com.example.springapp.dto.CreateCompanyRequest;
import com.example.springapp.exceptions.ResourceNotFoundException;
import com.example.springapp.model.Company;
import com.example.springapp.repository.CompanyRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompanyService {

    private final CompanyRepository companyRepo;

    public CompanyService(CompanyRepository companyRepo) {
        this.companyRepo = companyRepo;
    }

    public Page<CompanyDTO> listAll(int page, int size) {
        Pageable p = PageRequest.of(page, size);
        return companyRepo.findAll(p).map(this::toDto);
    }

    public Page<CompanyDTO> search(String q, int page, int size) {
        Pageable p = PageRequest.of(page, size);
        return companyRepo.search(q == null ? "" : q, p).map(this::toDto);
    }

    public CompanyDTO getById(Long id) {
        Company c = companyRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
        return toDto(c);
    }

    @Transactional
    public CompanyDTO create(CreateCompanyRequest req) {
        Company c = new Company();
        c.setName(req.getName());
        c.setDescription(req.getDescription());
        c.setLogoUrl(req.getLogoUrl());
        c.setStatus("PENDING");
        Company saved = companyRepo.save(c);
        return toDto(saved);
    }

    @Transactional
    public CompanyDTO update(Long id, CreateCompanyRequest req) {
        Company c = companyRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
        c.setName(req.getName());
        c.setDescription(req.getDescription());
        c.setLogoUrl(req.getLogoUrl());
        Company saved = companyRepo.save(c);
        return toDto(saved);
    }

    @Transactional
    public CompanyDTO changeStatus(Long id, String status) {
        Company c = companyRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
        c.setStatus(status);
        Company saved = companyRepo.save(c);
        return toDto(saved);
    }

    public void delete(Long id) {
        if (!companyRepo.existsById(id)) throw new ResourceNotFoundException("Company not found: " + id);
        companyRepo.deleteById(id);
    }

    private CompanyDTO toDto(Company c) {
        CompanyDTO dto = new CompanyDTO();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setDescription(c.getDescription());
        dto.setLogoUrl(c.getLogoUrl());
        dto.setStatus(c.getStatus());
        dto.setJobsCount(c.getJobs() == null ? 0L : (long) c.getJobs().size());
        return dto;
    }
}
