import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../../service/review.service';
import { take } from 'rxjs/operators';

interface ReviewModel {
  name: string;
  designation?: string;
  message: string;
}

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-form.html',
  styleUrls: ['./review-form.css']
})
export class ReviewForm {
  model: ReviewModel = { name: '', designation: '', message: '' };
  posting = false;
  success: string | null = null;
  error: string | null = null;

  constructor(private reviewSvc: ReviewService) {}

  submit(): void {
    // Reset messages
    this.success = null;
    this.error = null;

    // basic required guards (template also enforces required)
    if (!this.model.name || !this.model.name.trim()) {
      this.error = 'Please enter your name.';
      return;
    }
    if (!this.model.message || !this.model.message.trim()) {
      this.error = 'Please enter feedback.';
      return;
    }

    this.posting = true;

    this.reviewSvc.create({
      name: this.model.name.trim(),
      designation: (this.model.designation || '').trim(),
      message: this.model.message.trim()
    }).pipe(take(1)).subscribe({
      next: (res: any) => {
        this.posting = false;
        this.success = res?.message ?? 'Thank you — your feedback has been submitted.';
        this.error = null;

        

        this.resetModel();
      },
      error: (err) => {
        this.posting = false;
        console.error('Failed to submit review', err);
        this.error = (err?.error?.message) ? err.error.message : 'Failed to submit feedback. Try again later.';
      }
    });
  }

  resetModel(): void {
    this.model = { name: '', designation: '', message: '' };
  }

  resetForm(): void {
    this.resetModel();
    this.success = null;
    this.error = null;
  }
}
