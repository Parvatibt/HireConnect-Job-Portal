// src/main/java/com/example/springapp/controller/ReviewController.java
package com.example.springapp.controller;

import com.example.springapp.dto.ReviewDTO;
import com.example.springapp.service.ReviewService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600) // tighten for prod
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService svc;

    public ReviewController(ReviewService svc) {
        this.svc = svc;
    }

    public static class CreateRequest {
        @NotBlank public String name;
        public String designation;
        @NotBlank public String message;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateRequest req) {
        ReviewDTO dto = svc.create(req.name.trim(),
                req.designation == null ? null : req.designation.trim(),
                req.message.trim());
        return ResponseEntity.ok(Map.of(
                "message", "Thanks — feedback received",
                "id", dto.id,
                "review", dto
        ));
    }

    /** 🔹 Used by landing page — fail-soft to empty list on error */
    @GetMapping("/recent")
    public ResponseEntity<List<ReviewDTO>> recent(
            @RequestParam(value = "limit", required = false, defaultValue = "20") int limit) {
        try {
            return ResponseEntity.ok(svc.listRecent(limit));
        } catch (Throwable t) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ReviewDTO>> pending() {
        List<ReviewDTO> list = svc.listPending();
        return ResponseEntity.ok(list);
    }

    @GetMapping
    public ResponseEntity<?> listAll(
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size) {

        if (page == null || size == null) {
            List<ReviewDTO> all = svc.listAll();
            return ResponseEntity.ok(all);
        }

        int p = Math.max(0, page);
        int s = Math.max(1, size);

        List<ReviewDTO> all = svc.listAll();
        int total = all.size();
        int fromIndex = Math.min(total, p * s);
        int toIndex = Math.min(total, fromIndex + s);
        List<ReviewDTO> items = (fromIndex >= toIndex) ? Collections.emptyList() : all.subList(fromIndex, toIndex);

        Map<String, Object> resp = new HashMap<>();
        resp.put("items", items);
        resp.put("total", total);
        resp.put("page", p);
        resp.put("size", s);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ReviewDTO> approve(@PathVariable("id") Long id) {
        ReviewDTO updated = svc.approve(id);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ReviewDTO> reject(@PathVariable("id") Long id) {
        ReviewDTO updated = svc.reject(id);
        return ResponseEntity.ok(updated);
    }
}
