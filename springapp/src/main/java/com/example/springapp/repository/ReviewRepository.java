package com.example.springapp.repository;

import com.example.springapp.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    // return reviews ordered by id desc (newest first) with paging
    Page<Review> findAllByOrderByIdDesc(Pageable pageable);

    // list pending reviews (newest first)
    List<Review> findByStatusOrderByIdDesc(String status);
}
