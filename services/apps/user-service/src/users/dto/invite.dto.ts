import { UserRole } from '@app/user-service/common/types/user-role.enum';

export class InviteDto {
  id: string;
  email: string;
  role: UserRole;
}
