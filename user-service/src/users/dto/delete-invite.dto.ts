import { IsUUID } from 'class-validator';

export class DeleteInviteDto {
  @IsUUID()
  id: string;
}
