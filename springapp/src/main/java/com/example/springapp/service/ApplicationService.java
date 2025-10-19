package com.example.springapp.service;

import com.example.springapp.dto.ApplicationDTO;
import com.example.springapp.model.Application;
import com.example.springapp.repository.ApplicationRepository;
import com.example.springapp.repository.JobRepository;
import org.springframework.stereotype.Service;

@Service
public class ApplicationService {
    private final ApplicationRepository repo;
    private final JobRepository jobRepository;

    public ApplicationService(ApplicationRepository repo, JobRepository jobRepository) {
        this.repo = repo;
        this.jobRepository = jobRepository;
    }

    public ApplicationDTO create(ApplicationDTO dto) {
        var job = jobRepository.findById(dto.jobId).orElseThrow(() -> new IllegalArgumentException("Job not found"));
        Application a = new Application();
        a.setJob(job);
        a.setCandidateName(dto.candidateName);
        a.setCandidateEmail(dto.candidateEmail);
        a.setCandidatePhone(dto.candidatePhone);
        a.setCoverLetter(dto.coverLetter);
        a.setResumeFilename(dto.resumeFilename);
        Application saved = repo.save(a);

        ApplicationDTO out = new ApplicationDTO();
        out.id = saved.getId();
        out.jobId = job.getId();
        out.candidateName = saved.getCandidateName();
        out.candidateEmail = saved.getCandidateEmail();
        out.candidatePhone = saved.getCandidatePhone();
        out.coverLetter = saved.getCoverLetter();
        out.resumeFilename = saved.getResumeFilename();
        return out;
    }
}
