import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModule } from './users/users.module';
import { AuthModule } from '@app/auth';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@app/auth/jwt.auth.guard';
import { Reflector } from '@nestjs/core';
import { HealthController } from '@app/shared/controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CqrsModule.forRoot(),
    AuthModule,
    UsersModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => {
        return new JwtAuthGuard(reflector);
      },
      inject: [Reflector],
    },
  ],
})
export class AppModule {}
