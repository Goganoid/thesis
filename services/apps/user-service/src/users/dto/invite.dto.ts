import { UserRole } from '@app/shared';

export class InviteDto {
  id: string;
  email: string;
  role: UserRole;
}
