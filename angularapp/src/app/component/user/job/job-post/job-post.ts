import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-post.html',
  styleUrls: ['./job-post.css']
})
export class JobPostComponent {
  job = {
    title: '',
    company: '',
    location: '',
    category: '',
    description: ''
  };

  submitJob() {
    console.log('Job Posted:', this.job);
    alert('Job posted successfully!');
  }
}
