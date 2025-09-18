import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-candidate-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidate-profile.html',
  styleUrls: ['./candidate-profile.css']
})
export class CandidateProfileComponent {
  // Candidate profile data
  candidate = {
    firstName: '',
    lastName: '',
    email: '',
    skills: '',
    resume: null as File | null,
    profilePicture: null as string | null
  };

  applicationStatus = [
    { jobTitle: 'Frontend Developer', status: 'Under Review' },
    { jobTitle: 'Backend Developer', status: 'Shortlisted' },
    { jobTitle: 'UI/UX Designer', status: 'Rejected' }
  ];

  onFileSelected(event: any, type: 'resume' | 'profilePicture') {
    const file = event.target.files[0];
    if (type === 'resume') {
      this.candidate.resume = file;
    } else if (type === 'profilePicture') {
      const reader = new FileReader();
      reader.onload = () => {
        this.candidate.profilePicture = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    console.log('Profile saved:', this.candidate);
    alert('Profile updated successfully (not yet connected to backend).');
  }

  cancelEdit() {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      this.candidate = {
        firstName: '',
        lastName: '',
        email: '',
        skills: '',
        resume: null,
        profilePicture: null
      };
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'shortlisted':
        return 'status-shortlisted';
      case 'under review':
        return 'status-review';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-default';
    }
  }
}
