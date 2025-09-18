package com.example.springapp.repository;

import com.example.springapp.model.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    @Query("SELECT c FROM Company c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Company> search(String q, Pageable pageable);

    Page<Company> findByStatus(String status, Pageable pageable);
}
