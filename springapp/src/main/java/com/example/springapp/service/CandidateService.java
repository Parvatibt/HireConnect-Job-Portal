package com.example.springapp.service;

import com.example.springapp.model.Candidate;
import com.example.springapp.model.Education;
import com.example.springapp.repository.CandidateRepository;
import com.example.springapp.repository.EducationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final CandidateRepository candidateRepo;
    private final EducationRepository educationRepo;
    private final FileStorageService fileStorage;

    /**
     * Find candidate by username (throws runtime exception if not found).
     */
    public Candidate findByUsernameOrThrow(String username) {
        return candidateRepo.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Candidate not found: " + username));
    }

    /**
     * Save basic profile details (fullName, phone, location, pinCode)
     */
    public Candidate saveBasicProfile(String username, Candidate partial) {
        Candidate c = findByUsernameOrThrow(username);
        if (partial.getFullName() != null) c.setFullName(partial.getFullName());
        if (partial.getPhone() != null) c.setPhone(partial.getPhone());
        if (partial.getLocation() != null) c.setLocation(partial.getLocation());
        if (partial.getPinCode() != null) c.setPinCode(partial.getPinCode());
        return candidateRepo.save(c);
    }

    /**
     * Save list of educations, attach to candidate
     */
    public List<Education> saveEducations(String username, List<Education> educations) {
        Candidate c = findByUsernameOrThrow(username);
        for (Education e : educations) {
            e.setCandidate(c);
        }
        return educationRepo.saveAll(educations);
    }

    /**
     * Store resume bytes (via FileStorageService) and persist URL + original filename.
     * Returns the public URL where resume can be fetched.
     */
    public String storeResume(String username, MultipartFile file) {
        Candidate c = findByUsernameOrThrow(username);
        // store file on disk and get stored filename
        String storedFilename = fileStorage.storeResume(c.getUsername(), file);

        // build public URL (matches FileController mapping)
        String url = "/files/resumes/" + storedFilename;

        // save both URL (for direct open) and the original filename (for UI display)
        c.setResumeUrl(url);
        c.setResumeFilename(file.getOriginalFilename());

        candidateRepo.save(c);
        return url;
    }

    /**
     * Mark profileComplete = true
     */
    public Candidate markProfileComplete(String username) {
        Candidate c = findByUsernameOrThrow(username);
        c.setProfileComplete(true);
        return candidateRepo.save(c);
    }

    // optional: expose getProfile
    public Candidate getProfile(String username) {
        return findByUsernameOrThrow(username);
    }
}
