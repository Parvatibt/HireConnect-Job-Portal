package com.example.springapp.controller;

import com.example.springapp.dto.CandidateProfileDTO;
import com.example.springapp.model.Candidate;
import com.example.springapp.model.Education;
import com.example.springapp.repository.CandidateRepository;
import com.example.springapp.repository.EducationRepository;
import com.example.springapp.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateRepository candidateRepo;
    private final EducationRepository educationRepo;
    private final FileStorageService fileStorage;

    // ---------- Utility methods ----------
    private Candidate getOrCreateCandidate(Principal principal) {
        String name = principal.getName(); // JWT subject (username/email)
        return candidateRepo.findByUsername(name)
                .or(() -> candidateRepo.findByEmail(name))
                .orElseGet(() -> {
                    Candidate c = new Candidate();
                    c.setUsername(name);
                    if (name != null && name.contains("@")) c.setEmail(name);
                    c.setProfileComplete(false);
                    return candidateRepo.save(c);
                });
    }

    // ---------- READ PROFILE ----------
    @GetMapping("/me")
    public ResponseEntity<CandidateProfileDTO> me(Principal principal) {
        Candidate c = getOrCreateCandidate(principal);
        CandidateProfileDTO dto = new CandidateProfileDTO(
                c.getId(),
                c.getUsername(),
                c.getEmail(),
                c.getFullName(),
                c.getPhone(),
                c.getLocation(),
                c.getPinCode(),
                c.getHeadline(),
                c.getSkills(),
                c.getResumeUrl(),
                c.getResumeFilename(),
                c.isProfileComplete()
        );
        return ResponseEntity.ok(dto);
    }

    // ---------- STEP 1: BASIC INFO ----------
    @PostMapping("/me/basic")
    public ResponseEntity<CandidateProfileDTO> updateBasic(Principal principal, @RequestBody Candidate body) {
        Candidate c = getOrCreateCandidate(principal);

        if (body.getFullName() != null)  c.setFullName(body.getFullName());
        if (body.getPhone() != null)     c.setPhone(body.getPhone());
        if (body.getLocation() != null)  c.setLocation(body.getLocation());
        if (body.getPinCode() != null)   c.setPinCode(body.getPinCode());
        if (body.getHeadline() != null)  c.setHeadline(body.getHeadline());
        if (body.getSkills() != null)    c.setSkills(body.getSkills());

        Candidate saved = candidateRepo.save(c);

        CandidateProfileDTO dto = new CandidateProfileDTO(
                saved.getId(),
                saved.getUsername(),
                saved.getEmail(),
                saved.getFullName(),
                saved.getPhone(),
                saved.getLocation(),
                saved.getPinCode(),
                saved.getHeadline(),
                saved.getSkills(),
                saved.getResumeUrl(),
                saved.getResumeFilename(),
                saved.isProfileComplete()
        );
        return ResponseEntity.ok(dto);
    }

    // ---------- STEP 2: EDUCATION (READ) ----------
    @GetMapping("/me/educations")
    public ResponseEntity<List<Education>> getEducations(Principal principal) {
        Candidate c = getOrCreateCandidate(principal);
        return ResponseEntity.ok(educationRepo.findByCandidate(c));
    }


    @PostMapping("/me/educations")
    public ResponseEntity<List<Education>> saveEducations(Principal principal,
                                                        @RequestBody List<Education> list) {
        Candidate c = getOrCreateCandidate(principal);
        educationRepo.deleteByCandidate(c);          // clear previous entries

        for (Education e : list) {
            e.setId(null);                           // force insert
            e.setCandidate(c);                       // attach
        }
        List<Education> saved = educationRepo.saveAll(list);
        return ResponseEntity.ok(saved);             // ✅ candidate is @JsonIgnore, safe to serialize
    }


    // ---------- STEP 3A: RESUME UPLOAD ----------
    @PostMapping("/me/resume")
    public ResponseEntity<Map<String, String>> uploadResume(Principal principal,
                                                            @RequestParam("file") MultipartFile file) {
        Candidate c = getOrCreateCandidate(principal);

        // store returns stored filename — build URL and save original filename
        String storedFilename = fileStorage.storeResume(c.getUsername(), file);
        String url = "/files/resumes/" + storedFilename;

        c.setResumeUrl(url);
        c.setResumeFilename(file.getOriginalFilename());
        candidateRepo.save(c);

        return ResponseEntity.ok(Map.of(
                "resumeUrl", url,
                "resumeFilename", file.getOriginalFilename() == null ? "" : file.getOriginalFilename()
        ));
    }

    // ---------- STEP 3B: MARK COMPLETE ----------
    @PostMapping("/me/complete")
    public ResponseEntity<Void> complete(Principal principal) {
        Candidate c = getOrCreateCandidate(principal);
        c.setProfileComplete(true);
        candidateRepo.save(c);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
