import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application } from '../model/application.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private apiUrl = '/api/applications';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Application[]> {
    return this.http.get<Application[]>(this.apiUrl);
  }

  getById(id: number): Observable<Application> {
    return this.http.get<Application>(`${this.apiUrl}/${id}`);
  }

  create(application: Application): Observable<Application> {
    return this.http.post<Application>(this.apiUrl, application);
  }

  update(application: Application): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/${application.id}`, application);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
