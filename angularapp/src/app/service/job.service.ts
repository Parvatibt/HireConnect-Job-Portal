// src/app/service/job.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job } from '../model/job.model';

@Injectable({ providedIn: 'root' })
export class JobService {
  private apiUrl = '/api/jobs';

  constructor(private http: HttpClient) {}

  // Get all jobs (public listing)
  getAll(): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl);
  }

  // Create a job
  create(job: Partial<Job>): Observable<Job> {
    return this.http.post<Job>(this.apiUrl, job);
  }

  // Update an existing job (PUT /api/jobs/:id)
  update(id: number | undefined, job: Partial<Job>): Observable<Job> {
    if (id == null) throw new Error('Missing job id for update');
    return this.http.put<Job>(`${this.apiUrl}/${id}`, job);
  }

  // Get job by id
  getById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  // Delete job by id
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // List jobs owned by current recruiter (assumes backend exposes /api/jobs/mine)
  listMyJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/mine`);
  }
}
