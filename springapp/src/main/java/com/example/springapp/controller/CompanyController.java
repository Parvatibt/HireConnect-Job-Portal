package com.example.springapp.controller;

import com.example.springapp.dto.CompanyDTO;
import com.example.springapp.dto.CreateCompanyRequest;
import com.example.springapp.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService service;

    public CompanyController(CompanyService service) { this.service = service; }

    @GetMapping
    public Page<CompanyDTO> list(@RequestParam(defaultValue = "0") int page,
                                 @RequestParam(defaultValue = "10") int size) {
        return service.listAll(page, size);
    }

    @GetMapping("/search")
    public Page<CompanyDTO> search(@RequestParam String q,
                                   @RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "10") int size) {
        return service.search(q, page, size);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public ResponseEntity<CompanyDTO> create(@Valid @RequestBody CreateCompanyRequest req) {
        CompanyDTO created = service.create(req);
        return ResponseEntity.created(URI.create("/api/companies/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public ResponseEntity<CompanyDTO> update(@PathVariable Long id, @Valid @RequestBody CreateCompanyRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyDTO> changeStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(service.changeStatus(id, status));
    }
}
