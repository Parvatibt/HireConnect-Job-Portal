package com.example.springapp.service;

import com.example.springapp.dto.CreateJobRequest;
import com.example.springapp.dto.JobDTO;
import com.example.springapp.exceptions.ResourceNotFoundException;
import com.example.springapp.model.Company;
import com.example.springapp.model.Job;
import com.example.springapp.model.User;
import com.example.springapp.repository.CompanyRepository;
import com.example.springapp.repository.JobRepository;
import com.example.springapp.repository.UserRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class JobService {

    private final JobRepository jobRepo;
    private final CompanyRepository companyRepo;
    private final UserRepository userRepo;

    public JobService(JobRepository jobRepo, CompanyRepository companyRepo, UserRepository userRepo) {
        this.jobRepo = jobRepo;
        this.companyRepo = companyRepo;
        this.userRepo = userRepo;
    }

    public Page<JobDTO> listActive(int page, int size, String sortBy, boolean desc) {
        Sort sort = desc ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Job> p = jobRepo.findByIsActiveTrue(pageable);
        return p.map(JobMapper::toDto);
    }

    public Page<JobDTO> search(String q, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> p = jobRepo.searchActiveJobs(q == null ? "" : q, pageable);
        return p.map(JobMapper::toDto);
    }

    public JobDTO getById(Long id) {
        Job j = jobRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));
        return JobMapper.toDto(j);
    }

    @Transactional
    public JobDTO create(CreateJobRequest req, String postedByUsername) {
        Company company = companyRepo.findById(req.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + req.getCompanyId()));

        User postedBy = userRepo.findByUsername(postedByUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + postedByUsername));

        Job j = new Job();
        j.setTitle(req.getTitle());
        j.setDescription(req.getDescription());
        j.setLocation(req.getLocation());
        j.setEmploymentType(req.getEmploymentType());
        j.setCompany(company);
        j.setPostedBy(postedBy);
        j.setPostedAt(LocalDateTime.now());
        j.setActive(true);

        Job saved = jobRepo.save(j);
        return JobMapper.toDto(saved);
    }

    @Transactional
    public JobDTO update(Long id, CreateJobRequest req) {
        Job j = jobRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));
        j.setTitle(req.getTitle());
        j.setDescription(req.getDescription());
        j.setLocation(req.getLocation());
        j.setEmploymentType(req.getEmploymentType());

        if (req.getCompanyId() != null
                && !req.getCompanyId().equals((j.getCompany() != null) ? j.getCompany().getId() : null)) {
            Company company = companyRepo.findById(req.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + req.getCompanyId()));
            j.setCompany(company);
        }

        Job saved = jobRepo.save(j);
        return JobMapper.toDto(saved);
    }

    public void delete(Long id) {
        if (!jobRepo.existsById(id))
            throw new ResourceNotFoundException("Job not found: " + id);
        jobRepo.deleteById(id);
    }

    public Page<JobDTO> findByCompany(Long companyId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> p = jobRepo.findByCompanyId(companyId, pageable);
        return p.map(JobMapper::toDto);
    }
}
