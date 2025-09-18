import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-form.html',
  styleUrl: './review-form.css'
})
export class ReviewForm {
  role = '';
  reviewText = '';
  submitted = false;

  submitReview() {
    // Here you would send the review to a backend or service
    this.submitted = true;
    setTimeout(() => {
      this.submitted = false;
      this.role = '';
      this.reviewText = '';
    }, 2000);
  }
}
