import { Module } from '@nestjs/common';
import { LoginHandler } from './commands/auth/login.command';
import { RegisterHandler } from './commands/auth/register.command';
import { OrganizationRepository } from './repositories/organization.repository';
import { AuthController } from './controllers/auth.controller';
import { InvitesController } from './controllers/invites.controller';
import { GetInvitesHandler } from './queries/invites/get-invites.query';
import { SupabaseModule } from '../common/supabase/supabase.module';

const commands = [LoginHandler, RegisterHandler];
const queries = [GetInvitesHandler];
@Module({
  imports: [SupabaseModule],
  providers: [OrganizationRepository, ...commands, ...queries],
  controllers: [AuthController, InvitesController],
})
export class UsersModule {}
