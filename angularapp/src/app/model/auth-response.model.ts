import { User } from './user.model';

export interface AuthResponse {
   token: string;
  username?: string;   
  role?: string; 
}
