import { Job } from './job.model';
import { User } from './user.model';

export interface Application {
  id?: number;
  job: Job;
  candidate: User;
  appliedAt?: string;
  status?: 'SUBMITTED' | 'REVIEWED' | 'REJECTED' | 'ACCEPTED';
  resumeUrl?: string;
  coverLetter?: string;
}
