package com.example.springapp.service;

import com.example.springapp.model.User;
import com.example.springapp.repository.AdminRepository;
import com.example.springapp.repository.ApplicationRepository;
import com.example.springapp.repository.RecruiterRepository;
import com.example.springapp.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * UserService with robust delete that ensures any application rows
 * referencing applications.candidate_id = userId are removed first.
 */
@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final RecruiterRepository recruiterRepository;
    private final AdminRepository adminRepository;
    private final ApplicationRepository applicationRepository;

    @PersistenceContext
    private EntityManager em;

    public UserService(UserRepository repo,
                       PasswordEncoder passwordEncoder,
                       RecruiterRepository recruiterRepository,
                       AdminRepository adminRepository,
                       ApplicationRepository applicationRepository) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
        this.recruiterRepository = recruiterRepository;
        this.adminRepository = adminRepository;
        this.applicationRepository = applicationRepository;
    }

    // --- basic CRUD (kept minimal here) ---
    public List<User> findAll() { return repo.findAll(); }
    public Optional<User> findById(Long id) { return repo.findById(id); }
    public Optional<User> findByUsername(String username) { return repo.findByUsername(username); }

    public User createUser(User user) {
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return repo.save(user);
    }

    public User updateUser(User user) {
        String pwd = user.getPassword();
        if (pwd != null && !pwd.isBlank()) {
            if (!looksLikeBCryptHash(pwd)) user.setPassword(passwordEncoder.encode(pwd));
        }
        return repo.save(user);
    }

    public User save(User user) { return user.getId() == null ? createUser(user) : updateUser(user); }

    /**
     * Robust delete:
     * 1) try native delete via ApplicationRepository.deleteAllByCandidateIdNative
     * 2) if rows still exist, fallback to EntityManager native update
     * 3) unlink recruiter/admin
     * 4) delete user
     */
    @Transactional
    public void delete(Long id) {
        Optional<User> opt = repo.findById(id);
        if (opt.isEmpty()) {
            log.warn("Attempted to delete non-existing user id={}", id);
            throw new NoSuchElementException("User not found: " + id);
        }
        User user = opt.get();

        // 1) Attempt native delete via repository
        try {
            if (applicationRepository != null) {
                long beforeNative = 0;
                try {
                    beforeNative = applicationRepository.countByCandidateIdNative(id);
                } catch (Exception e) {
                    log.debug("countByCandidateIdNative not available: {}", e.toString());
                    // fall through to JPA count later
                }

                if (beforeNative > 0) {
                    log.info("Native: deleting {} application(s) with candidate_id={}", beforeNative, id);
                    applicationRepository.deleteAllByCandidateIdNative(id);
                } else {
                    // maybe native count not available; try JPA count
                    try {
                        long jpaCount = applicationRepository.countByCandidate_Id(id);
                        if (jpaCount > 0) {
                            log.info("JPA: deleting {} application(s) with candidate.id={}", jpaCount, id);
                            applicationRepository.deleteAllByCandidate_Id(id);
                        }
                    } catch (Exception ex) {
                        log.debug("JPA count/delete by candidate failed: {}", ex.toString());
                    }
                }

                // After attempted deletes, check again using a native count; if still >0, fall back to EM native SQL
                long remaining = 0;
                try {
                    remaining = applicationRepository.countByCandidateIdNative(id);
                } catch (Exception e) {
                    log.debug("countByCandidateIdNative not available for remaining check: {}", e.toString());
                    // attempt JPA count as last check
                    try { remaining = applicationRepository.countByCandidate_Id(id); } catch (Exception ex) { remaining = -1; }
                }

                if (remaining > 0) {
                    log.warn("After repository deletes, {} application(s) still reference candidate_id={}; using EM native SQL as fallback", remaining, id);
                    // Fallback: native SQL DELETE using EntityManager
                    int deleted = em.createNativeQuery("DELETE FROM applications WHERE candidate_id = :id")
                            .setParameter("id", id)
                            .executeUpdate();
                    log.info("EntityManager native delete removed {} application row(s) for candidate_id={}", deleted, id);
                }
            }
        } catch (Exception ex) {
            log.error("Error deleting application rows for candidate_id={}: {}", id, ex.toString());
            throw new IllegalStateException("Unable to remove application rows referencing user id=" + id, ex);
        }

        // 2) Unlink recruiter if exists
        try {
            if (recruiterRepository != null) {
                try {
                    recruiterRepository.findByUser(user).ifPresent(r -> {
                        r.setUser(null);
                        recruiterRepository.save(r);
                        log.info("Unlinked recruiter id={} from user id={}", r.getId(), id);
                    });
                } catch (Exception e) {
                    // fallback to id-based lookup
                    recruiterRepository.findByUser_Id(id).ifPresent(r -> {
                        r.setUser(null);
                        recruiterRepository.save(r);
                        log.info("Unlinked recruiter (by id) id={} from user id={}", r.getId(), id);
                    });
                }
            }
        } catch (Exception ex) {
            log.error("Error while unlinking recruiter for user id={}: {}", id, ex.toString());
            throw new IllegalStateException("Unable to unlink recruiter for user id=" + id, ex);
        }

        // 3) Unlink admin if exists
        try {
            if (adminRepository != null) {
                try {
                    adminRepository.findByUser(user).ifPresent(a -> {
                        a.setUser(null);
                        adminRepository.save(a);
                        log.info("Unlinked admin id={} from user id={}", a.getId(), id);
                    });
                } catch (Exception e) {
                    adminRepository.findByUser_Id(id).ifPresent(a -> {
                        a.setUser(null);
                        adminRepository.save(a);
                        log.info("Unlinked admin (by id) id={} from user id={}", a.getId(), id);
                    });
                }
            }
        } catch (Exception ex) {
            log.error("Error while unlinking admin for user id={}: {}", id, ex.toString());
            throw new IllegalStateException("Unable to unlink admin for user id=" + id, ex);
        }

        // 4) Finally delete user
        try {
            repo.deleteById(id);
            log.info("Deleted user id={}", id);
        } catch (DataIntegrityViolationException dive) {
            log.error("DataIntegrityViolation when deleting user id={}: {}", id, dive.toString());
            throw new IllegalStateException("Cannot delete user id=" + id + " due to database constraints", dive);
        } catch (Exception ex) {
            log.error("Unexpected error deleting user id={}: {}", id, ex.toString());
            throw new IllegalStateException("Unexpected error deleting user id=" + id, ex);
        }
    }

    // helpers
    private boolean looksLikeBCryptHash(String s) {
        if (s == null) return false;
        return s.startsWith("$2a$") || s.startsWith("$2b$") || s.startsWith("$2y$");
    }

    public boolean existsByUsername(String username) { return repo.existsByUsername(username); }
    public boolean existsByEmail(String email) { return repo.existsByEmail(email); }
}
