package com.example.springapp.service;

import com.example.springapp.dto.CompanyDTO;
import com.example.springapp.model.Company;
import com.example.springapp.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class CompanyService {

    private final CompanyRepository companyRepo;

    // upload dir (configurable)
    private final Path uploadDir;

    public CompanyService(CompanyRepository companyRepo,
                          @Value("${app.upload.dir:uploads/companies}") String uploadDirPath) {
        this.companyRepo = companyRepo;
        this.uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();

        try {
            if (!Files.exists(this.uploadDir)) {
                Files.createDirectories(this.uploadDir);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload dir: " + this.uploadDir, e);
        }
    }

    // map entity -> dto (compute logoUrl)
    private CompanyDTO mapToDto(Company c) {
        if (c == null) return null;
        CompanyDTO dto = new CompanyDTO();
        dto.id = c.getId();
        dto.name = c.getName();
        dto.description = c.getDescription();
        dto.about = c.getAbout();
        dto.location = c.getLocation();
        dto.industry = c.getIndustry();
        dto.website = c.getWebsite();
        dto.email = c.getEmail();
        dto.phone = c.getPhone();
        dto.founded = c.getFounded();
        dto.size = c.getSize();
        dto.createdBy = c.getCreatedBy();
        dto.verified = c.getVerified();
        dto.createdAt = c.getCreatedAt() != null ? c.getCreatedAt().toString() : null;
        dto.updatedAt = c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : null;

        if (c.getLogoFilename() != null && !c.getLogoFilename().isBlank()) {
            dto.logoUrl = "/api/companies/logos/" + c.getLogoFilename();
        } else {
            dto.logoUrl = null;
        }
        return dto;
    }

    // create company
    public CompanyDTO createCompany(CompanyDTO dto, String createdBy) {
        if (dto == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing company data");
        if (dto.name == null || dto.name.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Company name required");

        Company c = new Company();
        c.setName(dto.name.trim());
        c.setDescription(dto.description);
        c.setAbout(dto.about);
        c.setLocation(dto.location);
        c.setIndustry(dto.industry);
        c.setWebsite(dto.website);
        c.setEmail(dto.email);
        c.setPhone(dto.phone);
        c.setFounded(dto.founded);
        c.setSize(dto.size);
        c.setCreatedBy(createdBy);
        c.setVerified(dto.verified != null ? dto.verified : Boolean.FALSE);
        c.setCreatedAt(Instant.now());

        Company saved = companyRepo.save(c);
        return mapToDto(saved);
    }

    // update company (no ownership enforcement here; controller should check)
    public CompanyDTO updateCompany(Long id, CompanyDTO dto) {
        Company c = companyRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));
        if (dto.name != null) c.setName(dto.name);
        if (dto.description != null) c.setDescription(dto.description);
        if (dto.about != null) c.setAbout(dto.about);
        if (dto.location != null) c.setLocation(dto.location);
        if (dto.industry != null) c.setIndustry(dto.industry);
        if (dto.website != null) c.setWebsite(dto.website);
        if (dto.email != null) c.setEmail(dto.email);
        if (dto.phone != null) c.setPhone(dto.phone);
        if (dto.founded != null) c.setFounded(dto.founded);
        if (dto.size != null) c.setSize(dto.size);
        if (dto.verified != null) c.setVerified(dto.verified);

        Company saved = companyRepo.save(c);
        return mapToDto(saved);
    }

    public CompanyDTO getCompanyById(Long id) {
        Company c = companyRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));
        return mapToDto(c);
    }

    public List<CompanyDTO> listAll(String search) {
        List<Company> all = companyRepo.findAll();
        Stream<Company> stream = all.stream();
        if (search != null && !search.isBlank()) {
            final String s = search.trim().toLowerCase();
            stream = stream.filter(c -> (c.getName() != null && c.getName().toLowerCase().contains(s))
                    || (c.getIndustry() != null && c.getIndustry().toLowerCase().contains(s))
                    || (c.getLocation() != null && c.getLocation().toLowerCase().contains(s)));
        }
        return stream.map(this::mapToDto).collect(Collectors.toList());
    }

    /**
     * Save uploaded logo file for company. Returns the stored filename.
     * Replaces previous logoFilename on the entity.
     */
    public String saveLogoFile(Long companyId, org.springframework.web.multipart.MultipartFile file) {
        if (file == null || file.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File required");
        Company c = companyRepo.findById(companyId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));

        String original = Optional.ofNullable(file.getOriginalFilename()).orElse("logo");
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : "";
        String newFilename = UUID.randomUUID().toString() + ext;

        try {
            Path dest = uploadDir.resolve(newFilename).normalize();
            if (!dest.startsWith(uploadDir)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
            }
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

            // remove old logo file if exists
            String old = c.getLogoFilename();
            c.setLogoFilename(newFilename);
            companyRepo.save(c);

            if (old != null && !old.isBlank()) {
                try {
                    Path oldPath = uploadDir.resolve(old).normalize();
                    if (Files.exists(oldPath) && oldPath.startsWith(uploadDir)) Files.deleteIfExists(oldPath);
                } catch (Exception ex) {
                    // ignore deletion errors
                }
            }

            return newFilename;
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save logo file: " + ex.getMessage());
        }
    }

    /**
     * Read logo bytes by filename. Used by controller to serve static file content.
     */
    public byte[] readLogoFile(String filename) {
        if (filename == null || filename.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Filename required");
        Path filePath = uploadDir.resolve(filename).normalize();
        if (!filePath.startsWith(uploadDir) || !Files.exists(filePath)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        try {
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read file");
        }
    }

    /**
     * Verify company (admin action). Marks verified flag true and returns updated DTO.
     */
    public CompanyDTO verifyCompany(Long id) {
        Company c = companyRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));
        if (Boolean.TRUE.equals(c.getVerified())) {
            // already verified — return current DTO
            return mapToDto(c);
        }
        c.setVerified(Boolean.TRUE);
        c.setUpdatedAt(Instant.now());
        Company saved = companyRepo.save(c);
        return mapToDto(saved);
    }

    /**
     * Optional: delete company
     */
    public void deleteCompany(Long id) {
        Company c = companyRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));
        // attempt to remove logo file
        if (c.getLogoFilename() != null) {
            try {
                Path oldPath = uploadDir.resolve(c.getLogoFilename()).normalize();
                if (Files.exists(oldPath) && oldPath.startsWith(uploadDir)) Files.deleteIfExists(oldPath);
            } catch (Exception ignored) {}
        }
        companyRepo.deleteById(id);
    }
}
