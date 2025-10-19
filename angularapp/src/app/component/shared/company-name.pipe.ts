// src/app/shared/company-name.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { Job } from '../../model/job.model'; 

@Pipe({
  name: 'companyName',
  standalone: true
})
export class CompanyNamePipe implements PipeTransform {
  transform(jobOrCompany: Job | any): string {
    if (!jobOrCompany) return '—';

    // If caller passed a Job
    if ((jobOrCompany as Job).title !== undefined || (jobOrCompany as any).id !== undefined) {
      const job = jobOrCompany as Job;
      const comp = job.company as any;
      if (comp && typeof comp === 'object' && comp.name) return String(comp.name);
      if (job.companyName) return String(job.companyName);
      if (job.company && typeof job.company === 'string') return job.company;
      return '—';
    }

    // If caller passed a company object/string
    const company = jobOrCompany as any;
    if (!company) return '—';
    if (typeof company === 'string') return company;
    if (company.name) return String(company.name);
    if (company.companyName) return String(company.companyName);
    return '—';
  }
}
