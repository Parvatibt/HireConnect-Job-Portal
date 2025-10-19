import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from '../model/company.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly base = (environment.apiUrl && environment.apiUrl.length > 0)
    ? `${environment.apiUrl}/companies`
    : `/api/companies`;

  constructor(private http: HttpClient) {}

  /**
   * Get list of companies (optionally paginated, filtered, or sorted)
   */
  list(options?: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    sort?: string;
  }): Observable<Company[]> {
    let params = new HttpParams();
    if (options?.page != null) params = params.set('page', String(options.page));
    if (options?.size != null) params = params.set('size', String(options.size));
    if (options?.search) params = params.set('search', options.search);
    if (options?.status) params = params.set('status', options.status);
    if (options?.sort) params = params.set('sort', options.sort);

    return this.http.get<Company[]>(this.base, { params });
  }

  /**
   * Get a specific company by ID
   */
  get(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.base}/${id}`);
  }

  /**
   * Create a new company
   */
  create(payload: Partial<Company>): Observable<Company> {
    return this.http.post<Company>(this.base, payload);
  }

  /**
   * Update existing company by ID
   */
  update(id: number | string, payload: Partial<Company>): Observable<Company> {
    return this.http.put<Company>(`${this.base}/${id}`, payload);
  }

  /**
   * Delete a company (optional, admin only)
   */
  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /**
   * Upload company logo (multipart/form-data)
   * Backend endpoint: POST /api/companies/{id}/logo
   */
  uploadLogo(id: number | string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<any>(`${this.base}/${id}/logo`, formData);
  }

  /**
   * Optional: Verify company (if admin approves)
   * PATCH /api/companies/{id}/verify
   */
  verify(id: number | string): Observable<Company> {
    return this.http.patch<Company>(`${this.base}/${id}/verify`, {});
  }
}
