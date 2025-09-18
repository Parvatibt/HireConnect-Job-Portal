import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recruiter-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recruiter-profile.html',
  styleUrls: ['./recruiter-profile.css']
})
export class RecruiterProfileComponent {
  recruiter = {
    recruiterName: '',
    companyName: '',
    email: '',
    contact: '',
    designation: '',
    companyDescription: '',
    industry: '',
    companySize: '',
    location: '',
    website: '',
    profilePicture: null as string | null
  };

  jobRoles: any[] = [];

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.recruiter.profilePicture = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    console.log('Recruiter Profile:', this.recruiter);
    console.log('Job Roles:', this.jobRoles);
    alert('Recruiter profile updated successfully (backend integration pending).');
  }

  cancelEdit() {
    // Reset form or navigate away
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      // You can reset the form or navigate to another page
      this.recruiter = {
        recruiterName: '',
        companyName: '',
        email: '',
        contact: '',
        designation: '',
        companyDescription: '',
        industry: '',
        companySize: '',
        location: '',
        website: '',
        profilePicture: null
      };
      this.jobRoles = [];
    }
  }

  addJobRole() {
    this.jobRoles.push({
      title: '',
      department: '',
      experience: '',
      type: '',
      description: '',
      skills: '',
      salary: ''
    });
  }

  removeJobRole(index: number) {
    if (confirm('Are you sure you want to remove this job role?')) {
      this.jobRoles.splice(index, 1);
    }
  }
}