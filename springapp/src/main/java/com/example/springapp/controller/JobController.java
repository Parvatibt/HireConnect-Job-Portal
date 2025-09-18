package com.example.springapp.controller;

import com.example.springapp.dto.CreateJobRequest;
import com.example.springapp.dto.JobDTO;
import com.example.springapp.service.JobService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.security.Principal;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService service;

    public JobController(JobService service) { this.service = service; }

    /** List active jobs with pagination & sort (default sort by postedAt desc) */
    @GetMapping
    public Page<JobDTO> list(@RequestParam(defaultValue = "0") int page,
                             @RequestParam(defaultValue = "10") int size,
                             @RequestParam(defaultValue = "postedAt") String sortBy,
                             @RequestParam(defaultValue = "true") boolean desc) {
        return service.listActive(page, size, sortBy, desc);
    }

    /** Search jobs */
    @GetMapping("/search")
    public Page<JobDTO> search(@RequestParam String q,
                               @RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "10") int size) {
        return service.search(q, page, size);
    }

    /** Get single job */
    @GetMapping("/{id}")
    public ResponseEntity<JobDTO> get(@PathVariable Long id) {
        JobDTO dto = service.getById(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * Create job
     * Only recruiters and admins should be able to create jobs.
     * Adjust role strings to match your Role naming (ROLE_RECRUITER / ROLE_ADMIN).
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public ResponseEntity<JobDTO> create(@Valid @RequestBody CreateJobRequest req, Principal principal) {
        JobDTO created = service.create(req, principal.getName());
        return ResponseEntity.created(URI.create("/api/jobs/" + created.getId())).body(created);
    }

    /** Update job */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public ResponseEntity<JobDTO> update(@PathVariable Long id, @Valid @RequestBody CreateJobRequest req) {
        JobDTO updated = service.update(id, req);
        return ResponseEntity.ok(updated);
    }

    /** Delete job */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** List jobs by company */
    @GetMapping("/company/{companyId}")
    public Page<JobDTO> byCompany(@PathVariable Long companyId,
                                  @RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size) {
        return service.findByCompany(companyId, page, size);
    }
}
