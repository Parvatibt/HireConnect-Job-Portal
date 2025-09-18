import { User } from './user.model';
import { Company } from './company.model';

export interface Review {
  id?: number;
  author: User;
  company: Company;
  content: string;
  createdAt?: string;
  approved?: boolean;
}
