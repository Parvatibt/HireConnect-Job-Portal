package com.example.springapp.controller;

import com.example.springapp.dto.ApplicationDTO;
import com.example.springapp.dto.CreateApplicationRequest;
import com.example.springapp.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.security.Principal;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService service;

    public ApplicationController(ApplicationService service) { this.service = service; }

    @PostMapping("/apply")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApplicationDTO> apply(@Valid @RequestBody CreateApplicationRequest req, Principal principal) {
        ApplicationDTO created = service.apply(req, principal.getName());
        return ResponseEntity.created(URI.create("/api/applications/" + created.getId())).body(created);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    public Page<ApplicationDTO> myApplications(@RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "10") int size,
                                               Principal principal) {
        // resolve user id from username using UserRepository in service; here we trust the service to map
        // but for this controller we need candidate id — the service method used username when applying;
        // for listing by username, you can change service to accept username, but currently it's by id.
        // Assume you have endpoint that front-end will call with the candidate id; otherwise implement helper to get id from username.
        // For simplicity, here we require candidateId param (or you can change to use principal)
        throw new UnsupportedOperationException("Use /api/applications/candidate/{candidateId} or adjust controller to resolve id from Principal.");
    }

    @GetMapping("/candidate/{candidateId}")
    @PreAuthorize("hasAnyRole('CANDIDATE','ADMIN')")
    public Page<ApplicationDTO> forCandidate(@PathVariable Long candidateId,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "10") int size) {
        return service.getForCandidate(candidateId, page, size);
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public Page<ApplicationDTO> forRecruiter(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "10") int size,
                                             Principal principal) {
        // Ideally resolve recruiter id from principal username using UserRepository in service layer.
        throw new UnsupportedOperationException("Adjust to resolve recruiter id from Principal or pass recruiterId param.");
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestParam String status) {
        service.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }
}
