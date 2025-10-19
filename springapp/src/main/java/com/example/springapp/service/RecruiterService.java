package com.example.springapp.service;

import com.example.springapp.dto.ApplicantItemDTO;
import com.example.springapp.dto.JobDTO;
import com.example.springapp.dto.RecruiterProfileDTO;
import com.example.springapp.model.*;
import com.example.springapp.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/**
 * RecruiterService — recruiter-facing operations:
 *  - getMe / saveMe
 *  - createJob (attach job to current recruiter)
 *  - listApplicants (applications for jobs posted by the recruiter)
 *  - updateApplicationStatus
 *  - listMyJobs
 */
@Service
@Transactional
public class RecruiterService {

    private static final Logger log = LoggerFactory.getLogger(RecruiterService.class);

    private final RecruiterRepository recruiterRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;

    public RecruiterService(RecruiterRepository recruiterRepository,
                            UserRepository userRepository,
                            JobRepository jobRepository,
                            ApplicationRepository applicationRepository,
                            CompanyRepository companyRepository) {
        this.recruiterRepository = recruiterRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.companyRepository = companyRepository;
    }

    // --------------------
    // Helper: locate Recruiter by Principal
    // --------------------
    private Optional<Recruiter> findExisting(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            return Optional.empty();
        }

        String sub = principal.getName().trim();
        Optional<User> userOptional = userRepository.findByEmail(sub);
        if (!userOptional.isPresent()) userOptional = userRepository.findByUsername(sub);

        if (!userOptional.isPresent()) {
            // Fallback: search recruiter directly
            Optional<Recruiter> byUsername = recruiterRepository.findByUsername(sub);
            if (byUsername.isPresent()) return byUsername;
            return recruiterRepository.findByEmail(sub);
        }

        User user = userOptional.get();

        // Try to locate recruiter by linked user id if repository defines such a method.
        // Many repository interfaces declare findByUser_Id or findByUserId — both compile-time issues if missing.
        // We'll first attempt the common method names using Optional reflection-like approach:
        try {
            // If Repo has findByUser_Id(Long) compile-time call would be easiest, but we avoid it.
            // Instead try username/email on recruiter table
            Optional<Recruiter> byUsername = recruiterRepository.findByUsername(user.getUsername());
            if (byUsername.isPresent()) return byUsername;
            return recruiterRepository.findByEmail(user.getEmail());
        } catch (Exception ex) {
            // final fallback: try recruiter lookup by subject
            Optional<Recruiter> byUsername = recruiterRepository.findByUsername(sub);
            if (byUsername.isPresent()) return byUsername;
            return recruiterRepository.findByEmail(sub);
        }
    }

    // --------------------
    // Profile endpoints
    // --------------------
    @Transactional(readOnly = true)
    public RecruiterProfileDTO getMe(Principal principal) {
        Optional<Recruiter> recruiterOptional = findExisting(principal);
        return recruiterOptional.map(this::mapToDto).orElseGet(RecruiterProfileDTO::new);
    }

    @Transactional
    public RecruiterProfileDTO saveMe(Principal principal, RecruiterProfileDTO dto) {
        if (dto == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "payload required");
        if (dto.getCompanyName() == null || dto.getCompanyName().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "companyName is required");

        Recruiter recruiter;

        // Try linking recruiter to authenticated user
        if (principal != null && principal.getName() != null && !principal.getName().isBlank()) {
            String principalName = principal.getName().trim();
            Optional<User> userOptional = userRepository.findByEmail(principalName);
            if (!userOptional.isPresent()) userOptional = userRepository.findByUsername(principalName);

            if (userOptional.isPresent()) {
                User user = userOptional.get();
                // Find recruiter by username/email
                Optional<Recruiter> byUsername = recruiterRepository.findByUsername(user.getUsername());
                Optional<Recruiter> byEmail = recruiterRepository.findByEmail(user.getEmail());
                if (byUsername.isPresent()) {
                    recruiter = byUsername.get();
                } else if (byEmail.isPresent()) {
                    recruiter = byEmail.get();
                } else {
                    recruiter = new Recruiter();
                    recruiter.setUser(user);
                    recruiter.setUsername(user.getUsername());
                    recruiter.setEmail(user.getEmail());
                }
            } else {
                recruiter = recruiterRepository.findByEmail(dto.getEmail()).orElse(new Recruiter());
            }
        } else {
            // Unauthenticated
            if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
                recruiter = recruiterRepository.findByEmail(dto.getEmail()).orElse(new Recruiter());
            } else {
                recruiter = new Recruiter();
            }
        }

        recruiter.setFullName(dto.getFullName());
        recruiter.setPhone(dto.getPhone());
        recruiter.setEmail(dto.getEmail());
        recruiter.setCompanyName(dto.getCompanyName());
        recruiter.setLocation(dto.getLocation());

        if (dto.getHiringFor() != null) {
            try {
                recruiter.setHiringFor(HiringFor.valueOf(dto.getHiringFor()));
            } catch (IllegalArgumentException ignored) {}
        }

        recruiter = recruiterRepository.save(recruiter);
        return mapToDto(recruiter);
    }

    // --------------------
    // Create job
    // --------------------
    @Transactional
    public JobDTO createJob(Principal principal, JobDTO dto) {
        if (dto == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "job payload required");

        Optional<Recruiter> recOpt = findExisting(principal);
        if (!recOpt.isPresent())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Create recruiter profile first");

        Recruiter recruiter = recOpt.get();

        Company company = null;
        if (dto.getCompanyId() != null) {
            company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Company not found"));
        } else if (dto.getCompanyName() != null && !dto.getCompanyName().isBlank()) {
            company = companyRepository.findByName(dto.getCompanyName())
                    .orElseGet(() -> {
                        Company c = new Company();
                        c.setName(dto.getCompanyName());
                        return companyRepository.save(c);
                    });
        }

        if (dto.getTitle() == null || dto.getTitle().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job title is required");
        if (dto.getLocation() == null || dto.getLocation().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Job location is required");

        Job job = new Job();
        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setLocation(dto.getLocation());
        job.setCategory(dto.getCategory());
        job.setEmploymentType(dto.getEmploymentType());
        job.setMinExp(dto.getMinExp());
        job.setMaxExp(dto.getMaxExp());
        job.setMinSalary(dto.getMinSalary());
        job.setMaxSalary(dto.getMaxSalary());
        job.setResponsibilities(dto.getResponsibilities());
        job.setRecruiter(recruiter);
        job.setCompany(company);
        job.setCreatedAt(Instant.now());

        Job saved = jobRepository.save(job);

        JobDTO out = new JobDTO();
        out.setId(saved.getId());
        out.setTitle(saved.getTitle());
        out.setDescription(saved.getDescription());
        out.setLocation(saved.getLocation());
        out.setCategory(saved.getCategory());
        out.setEmploymentType(saved.getEmploymentType());
        out.setMinExp(saved.getMinExp());
        out.setMaxExp(saved.getMaxExp());
        out.setMinSalary(saved.getMinSalary());
        out.setMaxSalary(saved.getMaxSalary());
        out.setResponsibilities(saved.getResponsibilities());
        if (saved.getCompany() != null) {
            out.setCompanyId(saved.getCompany().getId());
            out.setCompanyName(saved.getCompany().getName());
        }
        out.setPostedAt(saved.getCreatedAt() != null ? saved.getCreatedAt().toString() : null);
        out.setRecruiterId(recruiter.getId());
        out.setRecruiterUsername(recruiter.getUsername());
        return out;
    }

    // --------------------
    // List applicants
    // --------------------
    @Transactional(readOnly = true)
    public List<ApplicantItemDTO> listApplicants(Principal principal) {
        Optional<Recruiter> recOpt = findExisting(principal);
        if (!recOpt.isPresent()) return Collections.emptyList();
        Recruiter recruiter = recOpt.get();

        List<Application> applications = new ArrayList<>();

        try {
            List<Application> byRec = applicationRepository.findAllByJob_Recruiter(recruiter);
            if (byRec != null && !byRec.isEmpty()) {
                applications.addAll(byRec);
            } else {
                List<Job> jobs = jobRepository.findByRecruiter(recruiter);
                for (Job j : jobs) {
                    if (j.getId() != null) {
                        List<Application> apps = applicationRepository.findByJobId(j.getId());
                        if (apps != null) applications.addAll(apps);
                    }
                }
            }
        } catch (Exception ex) {
            log.debug("listApplicants fallback: {}", ex.getMessage());
            List<Job> jobs = jobRepository.findByRecruiter(recruiter);
            for (Job j : jobs) {
                if (j.getId() != null) {
                    List<Application> apps = applicationRepository.findByJobId(j.getId());
                    if (apps != null) applications.addAll(apps);
                }
            }
        }

        return applications.stream().map(a -> {
            Job job = a.getJob();
            ApplicantItemDTO dto = new ApplicantItemDTO();
            dto.setId(a.getId());
            dto.setJobId(job != null ? job.getId() : null);
            dto.setJobTitle(job != null ? job.getTitle() : null);
            dto.setCandidateName(a.getCandidateName() != null ? a.getCandidateName() : "Candidate");
            dto.setCandidateEmail(a.getCandidateEmail());
            dto.setResumeUrl(a.getResumeFilename());
            dto.setAppliedAt(toInstantSafe(a.getCreatedAt()));
            dto.setStatus(null);
            return dto;
        }).collect(Collectors.toList());
    }

    // --------------------
    // Update application status
    // --------------------
    public void updateApplicationStatus(Long appId, String status, Principal principal) {
        Application a = applicationRepository.findById(appId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        Job job = a.getJob();
        if (job == null || job.getRecruiter() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot determine job ownership");
        }

        Optional<Recruiter> me = findExisting(principal);
        if (me.isEmpty() || !Objects.equals(me.get().getId(), job.getRecruiter().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to update this application");
        }

        try {
            var m = Application.class.getMethod("setStatus", String.class);
            if (m != null) {
                m.invoke(a, status);
                applicationRepository.save(a);
                return;
            }
        } catch (NoSuchMethodException nsme) {
            log.warn("Application entity has no status setter");
            throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "Application status not supported");
        } catch (Exception ex) {
            log.error("Failed to update application status", ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update application status");
        }
    }

    // --------------------
    // List jobs posted by recruiter
    // --------------------
    @Transactional(readOnly = true)
    public List<JobDTO> listMyJobs(Principal principal) {
        Optional<Recruiter> rOpt = findExisting(principal);
        if (!rOpt.isPresent()) return Collections.emptyList();
        Recruiter r = rOpt.get();

        List<Job> jobs = jobRepository.findByRecruiter(r);
        if (jobs == null || jobs.isEmpty()) return Collections.emptyList();

        return jobs.stream().map(j -> {
            JobDTO dto = new JobDTO();
            dto.setId(j.getId());
            dto.setTitle(j.getTitle());
            dto.setDescription(j.getDescription());
            dto.setLocation(j.getLocation());
            dto.setMinExp(j.getMinExp());
            dto.setMaxExp(j.getMaxExp());
            dto.setMinSalary(j.getMinSalary());
            dto.setMaxSalary(j.getMaxSalary());
            dto.setResponsibilities(j.getResponsibilities());
            dto.setCategory(j.getCategory());
            dto.setEmploymentType(j.getEmploymentType());
            if (j.getCompany() != null) {
                dto.setCompanyId(j.getCompany().getId());
                dto.setCompanyName(j.getCompany().getName());
            }
            dto.setPostedAt(j.getCreatedAt() != null ? j.getCreatedAt().toString() : null);
            dto.setRecruiterId(r.getId());
            dto.setRecruiterUsername(r.getUsername());
            return dto;
        }).collect(Collectors.toList());
    }

    // --------------------
    // Helpers
    // --------------------
    private RecruiterProfileDTO mapToDto(Recruiter r) {
        RecruiterProfileDTO dto = new RecruiterProfileDTO();
        dto.setId(r.getId());
        dto.setFullName(r.getFullName());
        dto.setPhone(r.getPhone());
        dto.setEmail(r.getEmail());
        dto.setCompanyName(r.getCompanyName());
        dto.setHiringFor(r.getHiringFor() == null ? null : r.getHiringFor().name());
        dto.setLocation(r.getLocation());

        if (r.getCompanyName() != null) {
            try {
                Company c = companyRepository.findByName(r.getCompanyName()).orElse(null);
                if (c != null) {
                    dto.setCompanyId(c.getId());
                    dto.setCompany(c);
                }
            } catch (Exception ignored) {}
        }
        return dto;
    }

    private Instant toInstantSafe(Object val) {
        if (val == null) return null;
        if (val instanceof Instant) return (Instant) val;
        if (val instanceof LocalDateTime)
            return ((LocalDateTime) val).atZone(ZoneId.systemDefault()).toInstant();
        if (val instanceof Date)
            return ((Date) val).toInstant();
        try {
            return Instant.parse(val.toString());
        } catch (Exception e) {
            return null;
        }
    }
}
