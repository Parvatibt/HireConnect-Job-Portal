import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-job-apply',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-apply.html',
  styleUrls: ['./job-apply.css']
})
export class JobApplyComponent {
  jobId: number | null = null;
  application = {
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    resume: ''
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.jobId = Number(this.route.snapshot.paramMap.get('id'));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.application.resume = file.name;
    }
  }

  cancelApplication() {
    this.application = {
      name: '',
      email: '',
      phone: '',
      coverLetter: '',
      resume: ''
    };
  }

  submitApplication() {
    console.log('Application submitted:', this.application);
    alert(`Application submitted for Job ID: ${this.jobId}`);
  }
}
