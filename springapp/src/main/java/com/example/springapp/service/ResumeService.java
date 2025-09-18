package com.example.springapp.service;

import com.example.springapp.model.Resume;
import com.example.springapp.repository.ResumeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResumeService {
    private final ResumeRepository repo;

    public ResumeService(ResumeRepository repo) {
        this.repo = repo;
    }

    public List<Resume> findAll() {
         return repo.findAll();
    }

    public Optional<Resume> findById(Long id) { 
        return repo.findById(id); 
    }

    public Resume save(Resume resume) { 
        return repo.save(resume); 
    }

    public void delete(Long id) {
         repo.deleteById(id); 
    }
}
