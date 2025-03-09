import { UserRole } from './user-role';

export interface JwtUser {
  id: string;
  role: UserRole;
}
