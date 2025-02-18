import { UserRole } from '@app/shared';
import { IsEmail, IsEnum } from 'class-validator';

export class CreateInviteDto {
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;
}
