import { Injectable, Logger } from '@nestjs/common';
import { User } from '@supabase/supabase-js';
import { ApiException } from '@app/ddd/types/api.exception';
import { SupabaseService } from '../../common/supabase/supabase.service';
import {
  CreateInviteEvent,
  CreateUserEvent,
  DeleteInviteEvent,
  DeleteUserEvent,
  OrganizationAggregate,
} from '../domain/organization.domain.entity';
import { signUpUser } from '../helpers/signup-user';
import { createUserProfile } from '../helpers/create-user-profile';
import { UserRole } from '@app/shared';

@Injectable()
export class OrganizationRepository {
  private logger = new Logger(OrganizationRepository.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getOrganization(): Promise<OrganizationAggregate> {
    const client = this.supabaseService.getClient();

    const userAuthData = await this.getAllUsers();
    const profilesResult = await client.from('profiles').select('*');

    if (profilesResult.error) {
      this.logger.error('Failed to fetch user profiles', profilesResult.error);
      throw new ApiException('Failed to fetch user profiles data');
    }

    const users = userAuthData
      .map((user) => {
        const profile = profilesResult.data.find((p) => p.id === user.id);
        if (!profile) {
          return null;
        }
        return {
          ...profile,
          role: profile.role as UserRole,
          id: user.id,
          email: user.email!,
        };
      })
      .filter((u) => u !== null);

    const invitesResult = await client.from('invites').select('*');

    if (invitesResult.error) {
      this.logger.error('Failed to fetch invites', invitesResult.error);
      throw new ApiException('Failed to fetch invites data');
    }

    return new OrganizationAggregate({
      invites: invitesResult.data.map((i) => ({
        id: i.id,
        email: i.email,
        role: i.role as UserRole,
      })),
      users,
    });
  }

  private async getAllUsers() {
    const client = this.supabaseService.getClient();

    const users: User[] = [];

    let usersResult = await client.auth.admin.listUsers();

    while (!usersResult.error) {
      users.push(...usersResult.data.users);
      if (usersResult.data.nextPage) {
        usersResult = await client.auth.admin.listUsers();
      } else {
        break;
      }
    }

    if (usersResult.error) {
      this.logger.error('Failed to fetch users', usersResult.error);
      throw new ApiException('Failed to fetch users', 500);
    }

    return users;
  }

  async save(organization: OrganizationAggregate) {
    const events = organization.getEvents();
    for (const event of events) {
      if (event.type === 'create_user') {
        await this.createUser(event);
      }
      if (event.type === 'delete_user') {
        await this.deleteUser(event);
      }
      if (event.type === 'create_invite') {
        await this.createInvite(event);
      }
      if (event.type === 'delete_invite') {
        await this.deleteInvite(event);
      }
    }
  }

  private async deleteUser(event: DeleteUserEvent) {
    const client = this.supabaseService.getClient();

    const userResult = await client.auth.admin.deleteUser(event.id);
    if (userResult.error) {
      this.logger.error(
        'Failed to delete user from supabase',
        userResult.error,
      );
      throw new ApiException(userResult.error.message, 500);
    }
    const profileResult = await client
      .from('profiles')
      .delete()
      .eq('id', event.id);

    if (profileResult.error) {
      this.logger.error(
        'Failed to delete user profile data',
        profileResult.error,
      );
      throw new ApiException(profileResult.error.message, 500);
    }
  }

  private async createUser(event: CreateUserEvent) {
    const supabase = this.supabaseService.getClient();

    const user = await signUpUser(supabase, event.email, event.password);
    await createUserProfile(supabase, {
      id: user.id,
      position: event.position,
      role: event.role,
      public_user_id: user.id,
    });
  }

  private async createInvite(event: CreateInviteEvent) {
    const supabase = this.supabaseService.getClient();
    const result = await supabase
      .from('invites')
      .insert({ email: event.email, role: event.role });
    if (result.error) {
      throw new ApiException(result.error.message, 500);
    }
  }

  private async deleteInvite(event: DeleteInviteEvent) {
    const supabase = this.supabaseService.getClient();
    const result = await supabase.from('invites').delete().eq('id', event.id);
    if (result.error) {
      throw new ApiException(result.error.message, 500);
    }
  }
}
