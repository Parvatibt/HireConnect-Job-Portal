import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebar } from '../../shared/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-manage-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebar],
  templateUrl: './manage-jobs.html',
  styleUrl: './manage-jobs.css'
})
export class ManageJobsComponent {
  jobs = [
    { id: 1, title: 'Frontend Developer', company: 'Google', status: 'Active' },
    { id: 2, title: 'Backend Developer', company: 'Amazon', status: 'Closed' }
  ];
}
