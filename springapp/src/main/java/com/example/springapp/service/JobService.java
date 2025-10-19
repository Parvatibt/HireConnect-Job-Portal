package com.example.springapp.service;

import com.example.springapp.dto.JobDTO;
import com.example.springapp.model.Company;
import com.example.springapp.model.Job;
import com.example.springapp.model.Recruiter;
import com.example.springapp.model.User;
import com.example.springapp.repository.CompanyRepository;
import com.example.springapp.repository.JobRepository;
import com.example.springapp.repository.RecruiterRepository;
import com.example.springapp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * JobService implementing methods used by JobController:
 *  - getAllJobs()
 *  - getJobById(id)
 *  - getJobsByRecruiter(username)
 *  - createJob(dto, username)
 *  - updateJob(id, dto, username)
 *  - deleteJob(id, username)
 *
 * Notes:
 *  - It expects RecruiterRepository to expose findByUser_Id(Long) and/or findByUsername/findByEmail.
 *  - CompanyRepository should expose findById and findByName (findByName optional; will create company if name present).
 */
@Service
@Transactional
public class JobService {

    private static final Logger log = LoggerFactory.getLogger(JobService.class);

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final RecruiterRepository recruiterRepository;
    private final CompanyRepository companyRepository;

    public JobService(JobRepository jobRepository,
                      UserRepository userRepository,
                      RecruiterRepository recruiterRepository,
                      CompanyRepository companyRepository) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.recruiterRepository = recruiterRepository;
        this.companyRepository = companyRepository;
    }

    // -------------------------
    // Public API used by controller
    // -------------------------

    @Transactional(readOnly = true)
    public List<JobDTO> getAllJobs() {
        // Use fetch-join query so company + recruiter are loaded to avoid lazy nulls during mapping/serialization
        return jobRepository.findAllWithCompanyAndRecruiter()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobDTO getJobById(Long id) {
        Job j = jobRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found id=" + id));
        return mapToDto(j);
    }

    /**
     * Return jobs posted by recruiter identified by 'username' (token subject).
     * Username may be an actual username or an email (we try both).
     */
    @Transactional(readOnly = true)
    public List<JobDTO> getJobsByRecruiter(String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        Recruiter recruiter = findRecruiterByPrincipalName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Recruiter profile not found"));

        return jobRepository.findByRecruiter(recruiter)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Create a job and attach to recruiter identified by 'username'.
     * username may be null — if so we reject.
     */
    public JobDTO createJob(JobDTO dto, String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required to post a job");
        }
        Recruiter recruiter = findRecruiterByPrincipalName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Recruiter profile not found; complete profile before posting jobs"));

        Company company = resolveOrCreateCompany(dto);

        validateJobDtoForCreate(dto);

        Job j = new Job();
        j.setTitle(dto.getTitle());
        j.setDescription(dto.getDescription());
        j.setLocation(dto.getLocation());
        j.setMinExp(dto.getMinExp());
        j.setMaxExp(dto.getMaxExp());
        j.setMinSalary(dto.getMinSalary());
        j.setMaxSalary(dto.getMaxSalary());
        j.setResponsibilities(dto.getResponsibilities());
        j.setEmploymentType(dto.getEmploymentType());
        j.setCategory(dto.getCategory());
        j.setCompany(company);
        j.setRecruiter(recruiter);
        // if Job entity has createdAt auto-managed by Hibernate you can skip this; kept to be explicit
        j.setCreatedAt(Instant.now());

        Job saved = jobRepository.save(j);
        log.debug("Created job id={} by recruiter id={}", saved.getId(), recruiter.getId());
        return mapToDto(saved);
    }

    /**
     * Update job — only owner recruiter may update.
     */
    public JobDTO updateJob(Long id, JobDTO dto, String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        Job existing = jobRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found id=" + id));

        Recruiter me = findRecruiterByPrincipalName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Recruiter profile not found"));

        if (existing.getRecruiter() == null || !me.getId().equals(existing.getRecruiter().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to modify this job");
        }

        // update allowed fields if provided (partial update pattern)
        if (dto.getTitle() != null) existing.setTitle(dto.getTitle());
        if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
        if (dto.getLocation() != null) existing.setLocation(dto.getLocation());
        if (dto.getMinExp() != null) existing.setMinExp(dto.getMinExp());
        if (dto.getMaxExp() != null) existing.setMaxExp(dto.getMaxExp());
        if (dto.getMinSalary() != null) existing.setMinSalary(dto.getMinSalary());
        if (dto.getMaxSalary() != null) existing.setMaxSalary(dto.getMaxSalary());
        if (dto.getResponsibilities() != null) existing.setResponsibilities(dto.getResponsibilities());
        if (dto.getEmploymentType() != null) existing.setEmploymentType(dto.getEmploymentType());
        if (dto.getCategory() != null) existing.setCategory(dto.getCategory());
        if (dto.getIsActive() != null) existing.setIsActive(dto.getIsActive());

        // company update: if dto has companyId or companyName, resolve
        if (dto.getCompanyId() != null || (dto.getCompanyName() != null && !dto.getCompanyName().isBlank())) {
            Company company = resolveOrCreateCompany(dto);
            existing.setCompany(company);
        }

        Job saved = jobRepository.save(existing);
        return mapToDto(saved);
    }

    /**
     * Delete job — only owner recruiter may delete.
     */
    public void deleteJob(Long id, String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        Job existing = jobRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found id=" + id));

        Recruiter me = findRecruiterByPrincipalName(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Recruiter profile not found"));

        if (existing.getRecruiter() == null || !me.getId().equals(existing.getRecruiter().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to delete this job");
        }

        jobRepository.delete(existing);
        log.debug("Deleted job id={} by recruiter id={}", id, me.getId());
    }

    // -------------------------
    // Helper methods
    // -------------------------

    /**
     * Try to locate a Recruiter given a token subject (username or email).
     * Strategy:
     *  1) try match user by email, then username (userRepository)
     *  2) if user found, try recruiterRepository.findByUser_Id(user.id)
     *  3) fallback to recruiterRepository.findByUsername(subject) or findByEmail(subject)
     */
    private Optional<Recruiter> findRecruiterByPrincipalName(String subject) {
        if (subject == null || subject.isBlank()) return Optional.empty();

        // try to find user by email or username
        Optional<User> u = userRepository.findByEmail(subject);
        if (u.isEmpty()) u = userRepository.findByUsername(subject);

        if (u.isPresent()) {
            // recruiterRepo should define findByUser_Id(Long)
            Optional<Recruiter> r = recruiterRepository.findByUser_Id(u.get().getId());
            if (r.isPresent()) return r;
        }

        // fallback to direct recruiter lookup
        Optional<Recruiter> byUsername = recruiterRepository.findByUsername(subject);
        if (byUsername.isPresent()) return byUsername;

        return recruiterRepository.findByEmail(subject);
    }

    private void validateJobDtoForCreate(JobDTO dto) {
        if (dto == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "payload required");
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job title is required");
        }
        if (dto.getLocation() == null || dto.getLocation().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job location is required");
        }
        // other validations as needed
    }

    /**
     * Resolve company by id or by name. If companyId provided we try to load it.
     * If companyName provided and not found, we create a minimal Company row.
     */
    private Company resolveOrCreateCompany(JobDTO dto) {
        Company company = null;
        if (dto.getCompanyId() != null) {
            company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Company not found id=" + dto.getCompanyId()));
        } else if (dto.getCompanyName() != null && !dto.getCompanyName().isBlank()) {
            String name = dto.getCompanyName().trim();
            Optional<Company> existing = companyRepository.findByName(name);
            if (existing.isPresent()) company = existing.get();
            else {
                Company c = new Company();
                c.setName(name);
                company = companyRepository.save(c);
            }
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Company id or company name required");
        }
        return company;
    }

    // mapping helper
    private JobDTO mapToDto(Job j) {
        JobDTO out = new JobDTO();
        out.setId(j.getId());
        out.setTitle(j.getTitle());
        out.setDescription(j.getDescription());
        out.setLocation(j.getLocation());
        out.setMinExp(j.getMinExp());
        out.setMaxExp(j.getMaxExp());
        out.setMinSalary(j.getMinSalary());
        out.setMaxSalary(j.getMaxSalary());
        out.setResponsibilities(j.getResponsibilities());
        out.setEmploymentType(j.getEmploymentType());
        out.setCategory(j.getCategory());

        // map isActive if present on entity (defensive)
        try {
            out.setIsActive(j.getIsActive() == null ? Boolean.TRUE : j.getIsActive());
        } catch (Exception ex) {
            out.setIsActive(Boolean.TRUE);
        }

        if (j.getCompany() != null) {
            out.setCompanyId(j.getCompany().getId());
            out.setCompanyName(j.getCompany().getName());
        }
        if (j.getCreatedAt() != null) {
            out.setPostedAt(j.getCreatedAt().toString());
        }

        if (j.getRecruiter() != null) {
            out.setRecruiterId(j.getRecruiter().getId());
            // prefer fullName if available, otherwise username
            String name = null;
            try {
                name = j.getRecruiter().getFullName();
            } catch (Exception ignored) {}
            if (name != null && !name.isBlank()) {
                out.setRecruiterUsername(name);
            } else {
                out.setRecruiterUsername(j.getRecruiter().getUsername());
            }
        }
        return out;
    }
}
