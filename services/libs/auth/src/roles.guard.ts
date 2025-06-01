import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserData } from './user.type';
import { UserRole } from '@app/shared';

export const Roles = Reflector.createDecorator<UserRole[]>();

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserData;
    if (!user) {
      return false;
    }
    const isAllowed = roles.includes(user.role);
    if (!isAllowed) {
      console.log('User is not allowed to access this resource', user);
    }
    return isAllowed;
  }
}
