import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReviewForm } from '../../review/review-form/review-form';
import { ReviewList } from '../../review/review-list/review-list';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReviewForm, ReviewList],
  templateUrl: './main-dashboard.html',
  styleUrls: ['./main-dashboard.css']
})
export class MainDashboardComponent {
  keyword = '';
  location = '';
  category = '';

  onSearch() {
    console.log('Searching jobs:', this.keyword, this.location, this.category);
    // TODO: Add navigation to jobs page with filters
  }
}
