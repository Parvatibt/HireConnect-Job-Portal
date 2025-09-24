import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  category: string;
  jobType: string; // e.g. 'Full-time'
  shortDescription: string;
};

@Component({
  selector: 'app-jobs-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './jobs-list.html',
  styleUrls: ['./jobs-list.css']
})
export class JobsListComponent {
  // search model
  query = {
    title: ''
  };

  // filter options
  categories = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales'];
  locations = ['Remote', 'London', 'New York', 'Bangalore', 'Berlin'];
  jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];

  // selected filters
  selectedCategories = new Set<string>();
  selectedLocations = new Set<string>();
  selectedJobTypes = new Set<string>();

  // sample jobs (replace with real API data)
  jobs: Job[] = [
    { id: 1, title: 'Frontend Engineer', company: 'Acme Labs', location: 'London', category: 'Engineering', jobType: 'Full-time', shortDescription: 'React/Angular developer working on UI components.' },
    { id: 2, title: 'Product Designer', company: 'ForgeCo', location: 'Remote', category: 'Design', jobType: 'Contract', shortDescription: 'Design delightful product experiences.' },
    { id: 3, title: 'Backend Engineer', company: 'Acme Labs', location: 'Bangalore', category: 'Engineering', jobType: 'Full-time', shortDescription: 'Node/Java microservices and integrations.' },
    { id: 4, title: 'Marketing Specialist', company: 'BrightAds', location: 'New York', category: 'Marketing', jobType: 'Part-time', shortDescription: 'Performance marketing and campaign ops.' },
    { id: 5, title: 'Data Analyst Intern', company: 'DataX', location: 'Berlin', category: 'Product', jobType: 'Internship', shortDescription: 'Analyze product metrics and dashboards.' }
  ];

  // search handler (could call API)
  onSearch() {
    // placeholder: in real app call API / refresh list
    console.log('Search', this.query);
  }

  // toggle helpers
  toggleCategory(c: string) {
    this.toggleSet(this.selectedCategories, c);
  }
  toggleLocation(l: string) {
    this.toggleSet(this.selectedLocations, l);
  }
  toggleJobType(t: string) {
    this.toggleSet(this.selectedJobTypes, t);
  }

  private toggleSet(set: Set<string>, value: string) {
    if (set.has(value)) set.delete(value);
    else set.add(value);
  }

  // filtered list (computed property)
  get filteredJobs(): Job[] {
    const q = (this.query.title || '').trim().toLowerCase();

    return this.jobs.filter(job => {
      // title / company search
      if (q) {
        const hay = (job.title + ' ' + job.company).toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // category filter
      if (this.selectedCategories.size > 0 && !this.selectedCategories.has(job.category)) {
        return false;
      }

      // location filter
      if (this.selectedLocations.size > 0 && !this.selectedLocations.has(job.location)) {
        return false;
      }

      // job type filter
      if (this.selectedJobTypes.size > 0 && !this.selectedJobTypes.has(job.jobType)) {
        return false;
      }

      return true;
    });
  }
}
