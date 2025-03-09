import { ApiException } from '@app/ddd/types/api.exception';
import { PersitenceEntity, DomainEntity } from '@app/ddd';
import { UserRole } from '@app/shared';

export type CreateUserEvent = {
  type: 'create_user';
  email: string;
  password: string;
  role: UserRole;
  position: string | null;
};
export type DeleteUserEvent = { type: 'delete_user'; id: string };
export type UserEvent = CreateUserEvent | DeleteUserEvent;

export type CreateInviteEvent = {
  type: 'create_invite';
  email: string;
  role: string;
};
export type DeleteInviteEvent = {
  type: 'delete_invite';
  id: string;
};
export type InviteEvent = CreateInviteEvent | DeleteInviteEvent;

export type OrganizationDomainEntityEvent = UserEvent | InviteEvent;

interface UserEntity extends PersitenceEntity {
  email: string;
  role: UserRole;
  position: string | null;
}

interface InviteEntity extends PersitenceEntity {
  email: string;
  role: UserRole;
}

interface Entity extends PersitenceEntity {
  users: UserEntity[];
  invites: InviteEntity[];
}

interface CreateUserOptions {
  email: string;
  password: string;
}

export class OrganizationAggregate extends DomainEntity<
  OrganizationDomainEntityEvent,
  Entity
> {
  createUser(options: CreateUserOptions) {
    const invite = this.entity.invites.find(
      (invite) => invite.email === options.email,
    );
    const isFirstUser = this.entity.users.length === 0;
    if (isFirstUser) {
      this.entity.users.push({
        email: options.email,
        position: null,
        role: UserRole.Admin,
      });
      this.events.push({
        type: 'create_user',
        email: options.email,
        password: options.password,
        position: null,
        role: UserRole.Admin,
      });
      return;
    }
    if (!invite) {
      throw new ApiException('User is not invited', 400);
    }
    this.entity.users.push({
      email: options.email,
      position: null,
      role: invite.role,
    });
    this.events.push({
      type: 'create_user',
      email: options.email,
      password: options.password,
      position: null,
      role: invite.role,
    });
  }

  deleteUser(userId: string, initiatorUserId: string) {
    const initiator = this.entity.users.find(
      (user) => user.id === initiatorUserId,
    );
    const deletedUser = this.entity.users.find((user) => user.id === userId);
    if (!deletedUser?.id || !initiator?.id) {
      throw new ApiException('User not found');
    }

    const removingThemselves = userId === initiatorUserId;
    if (removingThemselves) {
      throw new ApiException('Cannot remove yourself');
    }

    this.events.push({ type: 'delete_user', id: deletedUser.id });
  }

  createInvite(email: string, role: UserRole) {
    const existingInvite = this.entity.invites.find(
      (invite) => invite.email === email,
    );
    if (existingInvite) {
      throw new ApiException('Invite already exists');
    }
    const existingUser = this.entity.users.find(
      (user) => user.email === email,
    );
    if (existingUser) {
      throw new ApiException('User already exists');
    } 
    this.entity.invites.push({ email, role });
    this.events.push({ type: 'create_invite', email, role });
  }

  deleteInvite(id: string) {
    const existingInvite = this.entity.invites.find(
      (invite) => invite.id === id,
    );
    if (!existingInvite) {
      throw new ApiException('Invite not found', 404);
    }
    this.entity.invites = this.entity.invites.filter(
      (invite) => invite.id !== id,
    );
    this.events.push({ type: 'delete_invite', id });
  }
}
