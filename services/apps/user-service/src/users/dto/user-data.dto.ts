import { UserRole } from '@app/shared';

export interface UserDataDto {
  id: string;
  email: string;
  role: UserRole;
}
