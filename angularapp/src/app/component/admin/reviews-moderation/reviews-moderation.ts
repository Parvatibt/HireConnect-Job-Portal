import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebar } from '../../shared/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-reviews-moderation',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebar],
  templateUrl: './reviews-moderation.html',
  styleUrl: './reviews-moderation.css'
})
export class ReviewsModerationComponent {
  reviews = [
    { id: 1, content: 'Great platform!', status: 'Pending' },
    { id: 2, content: 'Not happy with recruiter response', status: 'Pending' }
  ];
}
