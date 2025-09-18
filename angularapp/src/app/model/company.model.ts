import { Job } from './job.model';

export interface Company {
  id?: number;
  name: string;
  description?: string;
  logoUrl?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  jobs?: Job[];
}
