import { Role } from './role.model';

export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  roles?: Role[];
}
