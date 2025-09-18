import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job } from '../model/job.model';

@Injectable({ providedIn: 'root' })
export class JobService {
  private apiUrl = '/api/jobs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl);
  }

  getById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  create(job: Job): Observable<Job> {
    return this.http.post<Job>(this.apiUrl, job);
  }

  update(job: Job): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/${job.id}`, job);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
