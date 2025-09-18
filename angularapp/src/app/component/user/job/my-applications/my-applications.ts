import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-applications.html',
  styleUrls: ['./my-applications.css']
})
export class MyApplicationsComponent {
  applications = [
    { id: 1, title: 'Frontend Developer', company: 'Tech Corp', status: 'Pending' },
    { id: 2, title: 'Backend Developer', company: 'Innovate Ltd', status: 'Interview Scheduled' },
  ];
}
