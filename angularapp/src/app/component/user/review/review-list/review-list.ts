import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-list.html',
  styleUrl: './review-list.css'
})
export class ReviewList {
  reviews = [
    { role: 'Candidate', text: 'Great platform! Found my dream job easily.', date: '2025-09-10' },
    { role: 'Recruiter', text: 'Very efficient for hiring quality candidates.', date: '2025-09-12' }
  ];
}
