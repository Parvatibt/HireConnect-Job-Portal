import { Company } from './company.model';
import { User } from './user.model';

export interface Job {
  id?: number;
  title: string;
  description?: string;
  location?: string;
  employmentType?: string;
  isActive?: boolean;
  postedAt?: string;
  company?: Company;
  postedBy?: User;
}
