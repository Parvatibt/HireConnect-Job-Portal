// src/app/service/review.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReviewCreate {
  name: string;
  designation?: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  // adjust base URL if your API is on another host
  private base = '/api/reviews';

  constructor(private http: HttpClient) {}

  create(payload: ReviewCreate): Observable<any> {
    return this.http.post<any>(`${this.base}`, payload);
  }

  // list recent reviews (returns newest first)
  listRecent(limit = 60): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/recent?limit=${limit}`);
  }

  // NEW: list all reviews (server should support pagination ideally)
  listAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}`); // GET /api/reviews
  }

  // Optional: server-side paginated list (example)
  // list(page = 0, size = 50): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.base}?page=${page}&size=${size}`);
  // }
}
