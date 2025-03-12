import { Module } from '@nestjs/common';
import { SupabaseModule } from '../common/supabase/supabase.module';
import { LoginHandler } from './commands/auth/login.command';
import { RefreshTokenHandler } from './commands/auth/refresh-token.command';
import { RegisterHandler } from './commands/auth/register.command';
import { CreateInviteHandler } from './commands/invites/create-invite.command';
import { DeleteInviteHandler } from './commands/invites/delete-invite.command';
import { AuthController } from './controllers/auth.controller';
import { InvitesController } from './controllers/invites.controller';
import { GetInvitesHandler } from './queries/get-invites.query';
import { GetUserDataHandler } from './queries/get-user-data.query';
import { OrganizationRepository } from './repositories/organization.repository';

const commands = [
  LoginHandler,
  RegisterHandler,
  RefreshTokenHandler,
  CreateInviteHandler,
  DeleteInviteHandler,
];
const queries = [GetInvitesHandler, GetUserDataHandler];
@Module({
  imports: [SupabaseModule],
  providers: [OrganizationRepository, ...commands, ...queries],
  controllers: [AuthController, InvitesController],
})
export class UsersModule {}
