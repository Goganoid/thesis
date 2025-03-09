import { UserRole } from '@app/shared';
import { ForbiddenException } from '@nestjs/common';

export const validateRole = (allowed: UserRole[], role: UserRole) => {
  if (!allowed.includes(role)) {
    throw new ForbiddenException(
      `Only ${allowed.join(', ')} can access this endpoint`,
    );
  }
};
