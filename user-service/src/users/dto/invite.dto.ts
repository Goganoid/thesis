import { UserRole } from 'src/common/types/user-role.enum';

export class InviteDto {
  id: string;
  email: string;
  role: UserRole;
}
