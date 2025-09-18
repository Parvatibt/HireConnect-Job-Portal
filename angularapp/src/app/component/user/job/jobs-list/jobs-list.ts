import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  category: string;
  experience?: string;
  description?: string;
  skills?: string[];
}

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './jobs-list.html',
  styleUrls: ['./jobs-list.css']
})
export class JobListComponent {
  jobs: Job[] = [
    { 
      id: 1, 
      title: 'Frontend Developer', 
      company: 'TechCorp', 
      location: 'Bangalore', 
      category: 'IT',
      experience: '2-5 years',
      description: 'We are looking for a skilled Frontend Developer to join our team. You will be responsible for building user-facing web applications using modern technologies.',
      skills: ['Angular', 'React', 'JavaScript', 'TypeScript', 'CSS']
    },
    { 
      id: 2, 
      title: 'Backend Developer', 
      company: 'CodeWorks', 
      location: 'Hyderabad', 
      category: 'IT',
      experience: '3-6 years',
      description: 'Join our backend team to build scalable and robust server-side applications. Work with cutting-edge technologies and cloud platforms.',
      skills: ['Node.js', 'Python', 'Java', 'AWS', 'MongoDB']
    },
    { 
      id: 3, 
      title: 'UI/UX Designer', 
      company: 'DesignStudio', 
      location: 'Mumbai', 
      category: 'Design',
      experience: '1-4 years',
      description: 'Create beautiful and intuitive user experiences. Work closely with product managers and developers to bring designs to life.',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator']
    },
    { 
      id: 4, 
      title: 'Data Scientist', 
      company: 'DataTech', 
      location: 'Pune', 
      category: 'IT',
      experience: '2-5 years',
      description: 'Analyze complex data sets to help drive business decisions. Work with machine learning models and statistical analysis.',
      skills: ['Python', 'R', 'Machine Learning', 'SQL', 'TensorFlow']
    },
    { 
      id: 5, 
      title: 'Marketing Manager', 
      company: 'GrowthCorp', 
      location: 'Delhi', 
      category: 'Marketing',
      experience: '3-7 years',
      description: 'Lead our marketing initiatives and drive growth. Develop and execute marketing strategies across digital channels.',
      skills: ['Digital Marketing', 'SEO', 'Google Analytics', 'Content Marketing', 'Social Media']
    },
    { 
      id: 6, 
      title: 'DevOps Engineer', 
      company: 'CloudTech', 
      location: 'Chennai', 
      category: 'IT',
      experience: '2-5 years',
      description: 'Manage our cloud infrastructure and deployment pipelines. Ensure high availability and performance of our systems.',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Linux']
    }
  ];

  getUniqueCompanies(): number {
    const companies = new Set(this.jobs.map(job => job.company));
    return companies.size;
  }

  getUniqueLocations(): number {
    const locations = new Set(this.jobs.map(job => job.location));
    return locations.size;
  }

  getJobSkills(job: Job): string[] {
    return job.skills || ['General Skills'];
  }

  getRandomDays(): number {
    return Math.floor(Math.random() * 30) + 1;
  }
}
