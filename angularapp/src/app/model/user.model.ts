import { Role } from './role.model';

export interface User {
  id?: number;
  username: string;         // required (maps to email in signup)
  email: string;
  password?: string;
  confirmPassword?: string; // only for signup
  firstName?: string;
  lastName?: string;
  phone?: string;
  roles?: Role[];
}
