// src/app/component/user/review/review-list/review-list.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../../service/review.service';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';

interface Review {
  id?: number;
  name: string;
  designation?: string;
  message: string;
  createdAt?: string;
}

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-list.html',
  styleUrls: ['./review-list.css']
})
export class ReviewList implements OnInit {
  reviews: Review[] = [];
  loading = false;
  error: string | null = null;

  // limit can be a number or 'all' to show everything
  limit: number | 'all' = 20;

  private sub: Subscription | null = null;

  constructor(private reviewSvc: ReviewService) {}

  ngOnInit(): void {
    this.reload();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  reload(): void {
    this.loading = true;
    this.error = null;
    this.reviews = [];

    // choose endpoint based on limit value
    const obs$ = this.limit === 'all'
      ? this.reviewSvc.listAll()
      : this.reviewSvc.listRecent(Number(this.limit));

    // take(1) to complete immediately
    this.sub = obs$.pipe(take(1)).subscribe({
      next: (list: any[]) => {
        this.reviews = Array.isArray(list) ? list.map(this.normalize) : [];
        this.loading = false;
      },
      error: (err) => {
        console.warn('Failed to load reviews', err);
        this.error = 'Failed to load reviews.';
        this.reviews = [];
        this.loading = false;
      }
    });
  }

  // Ensure each review has expected fields
  private normalize = (r: any): Review => ({
    id: r?.id ?? null,
    name: (r?.name ?? 'Anonymous'),
    designation: r?.designation ?? '',
    message: r?.message ?? '',
    createdAt: r?.createdAt ?? r?.created_at ?? null
  });

  trackById(index: number, item: Review) {
    return item?.id ?? index;
  }
}
