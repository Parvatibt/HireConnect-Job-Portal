package com.example.springapp.controller;

import com.example.springapp.model.Review;
import com.example.springapp.service.ReviewService;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    // Create new review
    @PostMapping
    public ResponseEntity<Review> create(@RequestBody Review r) {
        return ResponseEntity.ok(service.save(r));
    }

    // Get pending reviews (ADMIN only)
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public Page<Review> pending(@RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "10") int size) {
        return service.findPending(page, size);
    }

    // Approve a review (ADMIN only)
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> approve(@PathVariable Long id) {
        service.approve(id);
        return ResponseEntity.ok().build();
    }
}
