import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../model/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = '/api/reviews';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }

  getById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${id}`);
  }

  create(review: Review): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review);
  }

  update(review: Review): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${review.id}`, review);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
