import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { lastValueFrom, forkJoin } from 'rxjs';
import { ReviewService } from '../../../service/review.service'; // adjust path if needed

export interface Review {
  id?: number | null;
  name: string;
  designation?: string | null;
  message: string;
  createdAt?: string | null;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
}

@Component({
  selector: 'app-reviews-moderation',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './reviews-moderation.html',
  styleUrls: ['./reviews-moderation.css']
})
export class ReviewsModerationComponent implements OnInit {

  reviews: Review[] = [];
  loading = false;
  actionLoading = new Map<number, boolean>();
  error = '';

  // backend endpoints used for approve/reject - you can refactor them into ReviewService
  private readonly base = '/api/reviews';

  constructor(private reviewService: ReviewService,
              private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.loading = true;
    this.error = '';
    // I expect backend to provide /api/reviews/pending — if yours uses a different URL,
    // update the call below or add method in ReviewService.
    this.http.get<Review[]>(`${this.base}/pending`)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          // newest first
          this.reviews = (data || []).slice().sort((a, b) => {
            const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
            const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
            return tb - ta;
          });
        },
        error: (err) => {
          console.error('Failed to load pending reviews', err);
          this.error = err?.error?.message || err?.message || 'Failed to load pending reviews';
        }
      });
  }

  approve(review: Review): void {
    if (!review?.id) return;
    if (!confirm(`Approve review by "${review.name}"?`)) return;
    this.setActionLoading(review.id, true);

    // POST /api/reviews/{id}/approve
    this.http.post(`${this.base}/${review.id}/approve`, {})
      .pipe(finalize(() => this.setActionLoading(review.id, false)))
      .subscribe({
        next: () => this.removeFromList(review.id!),
        error: (err) => {
          console.error('Approve failed', err);
          alert(err?.error?.message || 'Approve failed — check console');
        }
      });
  }

  reject(review: Review): void {
    if (!review?.id) return;
    if (!confirm(`Reject review by "${review.name}"?`)) return;
    this.setActionLoading(review.id, true);

    // POST /api/reviews/{id}/reject
    this.http.post(`${this.base}/${review.id}/reject`, {})
      .pipe(finalize(() => this.setActionLoading(review.id, false)))
      .subscribe({
        next: () => this.removeFromList(review.id!),
        error: (err) => {
          console.error('Reject failed', err);
          alert(err?.error?.message || 'Reject failed — check console');
        }
      });
  }

  // Bulk approve visible reviews (uses forkJoin to call approve endpoints in parallel)
  approveAllVisible(): void {
    if (!confirm('Approve ALL visible pending reviews?')) return;
    const ids = this.reviews.map(r => r.id).filter(id => id != null) as number[];
    if (!ids.length) return;

    // mark all as loading
    ids.forEach(id => this.setActionLoading(id, true));

    // build array of observables
    const calls = ids.map(id => this.http.post(`${this.base}/${id}/approve`, {}));
    forkJoin(calls).subscribe({
      next: () => {
        // refresh the list (or remove approved items)
        this.loadPending();
      },
      error: (err) => {
        console.error('Bulk approve error', err);
        alert('Bulk approve failed — check console');
      },
      complete: () => {
        ids.forEach(id => this.setActionLoading(id, false));
      }
    });
  }

  // alternative sequential approve using async/await and lastValueFrom (example)
  async approveAllSequential(): Promise<void> {
    if (!confirm('Approve ALL visible pending reviews sequentially?')) return;
    const ids = this.reviews.map(r => r.id).filter(id => id != null) as number[];
    if (!ids.length) return;

    try {
      for (const id of ids) {
        this.setActionLoading(id, true);
        // lastValueFrom converts observable to promise in modern RxJS
        await lastValueFrom(this.http.post(`${this.base}/${id}/approve`, {}));
        this.setActionLoading(id, false);
      }
      // reload after all succeed
      this.loadPending();
    } catch (err) {
      console.error('Sequential bulk approve error', err);
      alert('Bulk approve failed — check console');
      // ensure we clear loading flags
      ids.forEach(id => this.setActionLoading(id, false));
    }
  }

  private setActionLoading(id: number | null | undefined, v: boolean) {
    if (id == null) return;
    if (v) this.actionLoading.set(id, true);
    else this.actionLoading.delete(id);
  }

  isActionLoading(id?: number | null): boolean {
    if (id == null) return false;
    return this.actionLoading.has(id);
  }

  private removeFromList(id: number): void {
    this.reviews = this.reviews.filter(r => r.id !== id);
  }
}
