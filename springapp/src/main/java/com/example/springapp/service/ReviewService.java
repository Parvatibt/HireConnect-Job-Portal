package com.example.springapp.service;

import com.example.springapp.model.Review;
import com.example.springapp.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {
    private final ReviewRepository repo;

    public ReviewService(ReviewRepository repo) {
        this.repo = repo;
    }

    public List<Review> findAll() {
        return repo.findAll();
    }

    public Optional<Review> findById(Long id) {
        return repo.findById(id);
    }

    public Review save(Review review) {
        return repo.save(review);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    // 🔹 Pending reviews (approved = false)
    public Page<Review> findPending(int page, int size) {
        return repo.findByApproved(false, PageRequest.of(page, size));
    }

    // 🔹 Approve review
    public void approve(Long id) {
        Review review = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + id));
        review.setApproved(true);
        repo.save(review);
    }

    // 🔹 Get reviews by company
    public Page<Review> findByCompany(Long companyId, int page, int size) {
        return repo.findByCompanyId(companyId, PageRequest.of(page, size));
    }
}
