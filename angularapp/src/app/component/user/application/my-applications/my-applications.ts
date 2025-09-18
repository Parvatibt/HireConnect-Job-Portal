import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-applications.html',
  styleUrls: ['./my-applications.css']
})
export class MyApplicationsComponent {
  applications = [
    { jobTitle: 'Frontend Developer', company: 'Infosys', status: 'Pending' },
    { jobTitle: 'Backend Engineer', company: 'Wipro', status: 'Reviewed' },
    { jobTitle: 'Full Stack Developer', company: 'TCS', status: 'Accepted' },
    { jobTitle: 'UI/UX Designer', company: 'HCL', status: 'Rejected' }
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'badge pending';
      case 'Reviewed': return 'badge reviewed';
      case 'Accepted': return 'badge accepted';
      case 'Rejected': return 'badge rejected';
      default: return 'badge';
    }
  }
}
