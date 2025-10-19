package com.example.springapp.controller;

import com.example.springapp.dto.CompanyDTO;
import com.example.springapp.service.CompanyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private static final Logger logger = LoggerFactory.getLogger(CompanyController.class);

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    /**
     * List companies (optional search query param)
     */
    @GetMapping
    public ResponseEntity<List<CompanyDTO>> list(@RequestParam(value = "search", required = false) String search) {
        List<CompanyDTO> list = companyService.listAll(search);
        return ResponseEntity.ok(list);
    }

    /**
     * Get single company by id
     */
    @GetMapping("/{id}")
    public ResponseEntity<CompanyDTO> getOne(@PathVariable Long id) {
        CompanyDTO dto = companyService.getCompanyById(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * Public listing alias (optional)
     */
    @GetMapping("/public")
    public ResponseEntity<List<CompanyDTO>> listPublic(@RequestParam(value = "search", required = false) String search) {
        List<CompanyDTO> list = companyService.listAll(search);
        return ResponseEntity.ok(list);
    }

    /**
     * Create a company (recruiter should be authenticated).
     */
    @PostMapping
    public ResponseEntity<CompanyDTO> create(@RequestBody CompanyDTO dto, Principal principal) {
        String username = principal != null ? principal.getName() : null;
        CompanyDTO created = companyService.createCompany(dto, username);
        return ResponseEntity.ok(created);
    }

    /**
     * Update company (owner/admin should be checked in security config or add logic here).
     */
    @PutMapping("/{id}")
    public ResponseEntity<CompanyDTO> update(@PathVariable Long id, @RequestBody CompanyDTO dto, Principal principal) {
        CompanyDTO updated = companyService.updateCompany(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete company (admin only recommended)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Upload logo file for company (multipart form).
     * Endpoint: POST /api/companies/{id}/logo
     */
    @PostMapping("/{id}/logo")
    public ResponseEntity<?> uploadLogo(@PathVariable Long id, @RequestParam("file") MultipartFile file, Principal principal) {
        String filename = companyService.saveLogoFile(id, file);
        return ResponseEntity.ok(Map.of("filename", filename, "logoUrl", "/api/companies/logos/" + filename));
    }

    /**
     * Serve stored logos by filename (public URL)
     * GET /api/companies/logos/{filename}
     */
    @GetMapping("/logos/{filename:.+}")
    public ResponseEntity<byte[]> getLogo(@PathVariable String filename, HttpServletRequest req) {
        byte[] data = companyService.readLogoFile(filename);
        String contentType = null;
        try {
            contentType = req.getServletContext().getMimeType(filename);
        } catch (Exception ignored) {}
        if (contentType == null) contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setCacheControl(CacheControl.noCache().getHeaderValue());
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    /**
     * VERIFY endpoint — admin should call this to mark company verified.
     * PATCH /api/companies/{id}/verify
     */
    @PatchMapping("/{id}/verify")
    public ResponseEntity<CompanyDTO> verifyCompany(@PathVariable Long id, Principal principal) {
        // Optionally: check principal has admin role here, or rely on method/security config.
        CompanyDTO updated = companyService.verifyCompany(id);
        return ResponseEntity.ok(updated);
    }
}
