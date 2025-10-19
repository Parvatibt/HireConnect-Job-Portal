package com.example.springapp.service;

import com.example.springapp.dto.ReviewDTO;
import com.example.springapp.model.Review;
import com.example.springapp.repository.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ReviewService — provides create, list (recent / pending / all / paged),
 * and admin actions (approve / reject).
 */
@Service
public class ReviewService {

    private final ReviewRepository repo;

    public ReviewService(ReviewRepository repo) {
        this.repo = repo;
    }

    /**
     * Create a new review (status = PENDING).
     */
    public ReviewDTO create(String name, String designation, String message) {
        Review r = new Review();
        r.setName(name);
        r.setDesignation(designation);
        r.setMessage(message);
        r.setStatus("PENDING");
        Review saved = repo.save(r);
        return toDto(saved);
    }

    /**
     * Return up to `limit` recent reviews (newest-first).
     * Uses repository paging for efficiency.
     */
    public List<ReviewDTO> listRecent(int limit) {
        int size = Math.max(1, limit);
        PageRequest pageReq = PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Review> page = repo.findAll(pageReq);
        return page.getContent().stream().map(this::toDto).collect(Collectors.toList());
    }

    /**
     * Return pending reviews (newest-first).
     * If you expect lots of pending rows, consider adding paging here too.
     */
    public List<ReviewDTO> listPending() {
        return repo.findByStatusOrderByIdDesc("PENDING")
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Return all reviews (newest-first).
     * This will load all rows into memory — use with caution for large datasets.
     * Prefer listPage(Pageable) for paginated access.
     */
    public List<ReviewDTO> listAll() {
        // findAll with sort to get newest first
        List<Review> list = repo.findAll(Sort.by(Sort.Direction.DESC, "id"));
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    /**
     * Return a server-side page of reviews (recommended for large data).
     * Example call: listPage(PageRequest.of(page, size, Sort.by(Direction.DESC, "id")))
     */
    public Page<ReviewDTO> listPage(Pageable pageable) {
        Page<Review> page = repo.findAll(pageable);
        // Map to DTO page
        return page.map(this::toDto);
    }

    /**
     * Approve a review, return updated DTO.
     */
    public ReviewDTO approve(Long id) {
        Review r = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Review not found: " + id));
        r.setStatus("APPROVED");
        Review saved = repo.save(r);
        return toDto(saved);
    }

    /**
     * Reject a review, return updated DTO.
     */
    public ReviewDTO reject(Long id) {
        Review r = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Review not found: " + id));
        r.setStatus("REJECTED");
        Review saved = repo.save(r);
        return toDto(saved);
    }

    /**
     * Helper: convert entity -> dto (including createdAt)
     */
    private ReviewDTO toDto(Review r) {
        ReviewDTO d = new ReviewDTO();
        d.id = r.getId();
        d.name = r.getName();
        d.designation = r.getDesignation();
        d.message = r.getMessage();
        d.status = r.getStatus();
        // createdAt in your Review entity should be an Instant (or Date) and exposed in DTO
        d.createdAt = r.getCreatedAt();
        return d;
    }
}
