import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-details.html',
  styleUrls: ['./job-details.css']
})
export class JobDetailsComponent {
  jobId: number | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.jobId = Number(this.route.snapshot.paramMap.get('id'));
    // TODO: fetch job details from API
  }

  applyForJob() {
    // Navigate to job apply page with the job ID
    this.router.navigate(['/job-apply', this.jobId]);
  }
}
