import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateService } from '../../../../service/candidate.service'; // <--- adjust path if file is at different depth

@Component({
  selector: 'app-candidate-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidate-applications.html',
  styleUrls: ['./candidate-applications.css']
})
export class CandidateApplicationsComponent implements OnInit {
  apps: any[] = [];
  loading = true;

  constructor(private svc: CandidateService) {}

  ngOnInit() {
    this.svc.getApplications().subscribe({
      next: (list: any[]) => { this.apps = list; this.loading = false; },
      error: (err: any) => { console.error(err); this.loading = false; }
    });
  }
}
