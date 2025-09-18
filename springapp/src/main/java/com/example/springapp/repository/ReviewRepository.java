package com.example.springapp.repository;

import com.example.springapp.model.Review;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByApproved(boolean approved, Pageable pageable);
    

    @Query("SELECT r FROM Review r WHERE r.company.id = :companyId")
    Page<Review> findByCompanyId(@Param("companyId") Long companyId, Pageable pageable);

}
