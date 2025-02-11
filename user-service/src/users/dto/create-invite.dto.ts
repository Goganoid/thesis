import { IsEmail, IsEnum } from 'class-validator';
import { UserRole } from 'src/common/types/user-role.enum';

export class CreateInviteDto {
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;
}
