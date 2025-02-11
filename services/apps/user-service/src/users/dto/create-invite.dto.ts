import { UserRole } from '@app/user-service/common/types/user-role.enum';
import { IsEmail, IsEnum } from 'class-validator';

export class CreateInviteDto {
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;
}
