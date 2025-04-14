import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GrpcMethod } from '@nestjs/microservices';
import { GetManyUsersQuery } from '../queries/get-many-users.query';
import { ProtoUser } from '@app/shared/proto/interfaces/users';
@Controller()
export class UsersGrpcController {
  constructor(private readonly queryBus: QueryBus) {}

  @GrpcMethod('UserService', 'FindMany')
  async findMany(payload: { ids: string[] }): Promise<{ users: ProtoUser[] }> {
    const result = await this.queryBus.execute(
      new GetManyUsersQuery(payload.ids),
    );
    return {
      users: result.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
      })),
    };
  }
}
