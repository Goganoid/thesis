import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { USER_CLIENT_TOKEN } from './tokens';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@app/shared/proto/interfaces/users';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UserClient {
  private userService: UserService;
  constructor(
    @Inject(USER_CLIENT_TOKEN) private readonly client: ClientGrpc,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.userService = this.client.getService<UserService>(
      this.configService.getOrThrow('USER_SERVICE_GPRC_NAME'),
    );
  }

  findMany(idList: string[]) {
    return lastValueFrom(this.userService.findMany({ ids: idList })).then(
      (res) => res.users,
    );
  }
}
