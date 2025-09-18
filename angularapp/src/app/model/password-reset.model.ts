export interface PasswordReset {
  id?: number;
  userId: number;
  token: string;
  expiresAt: string;
  used?: boolean;
}
