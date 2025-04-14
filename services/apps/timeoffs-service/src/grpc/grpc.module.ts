import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { USER_CLIENT_TOKEN } from './tokens';
import { UserClient } from './user-client.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: USER_CLIENT_TOKEN,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow('USER_SERVICE_GRPC_URL'),
            package: configService.getOrThrow('USER_SERVICE_GRPC_PACKAGE'),
            protoPath: join(__dirname, '..', 'proto/users.proto'),
          },
        }),
        imports: [ConfigModule],
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [UserClient],
  exports: [UserClient],
})
export class GrpcModule {}
