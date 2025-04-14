import { AuthModule } from '@app/auth';
import { JwtAuthGuard } from '@app/auth/jwt.auth.guard';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateTeamHandler } from './commands/admin/create-team.command';
import { UpdateLeaveRequestHandler } from './commands/admin/update-leave-request.command';
import { UpdateSettingsHandler } from './commands/admin/update-setttings.command';
import { UpdateTeamHandler } from './commands/admin/update-team.command';
import { AddLeaveRequestHandler } from './commands/user/add-leave-request.command';
import { TimeoffsController } from './controllers/timeoffs.controller';
import { LeaveRequestEntity } from './entities/leave-request.entity';
import { SettingsEntity } from './entities/settings.entity';
import { TeamEntity } from './entities/team.entity';
import { GrpcModule } from './grpc/grpc.module';
import { GetMyTeamsQueryHandler } from './queries/get-my-teams.query';
import { GetSettingsHandler } from './queries/get-settings-query';
import { GetTeamLeaveRequestsHandler } from './queries/get-team-leave-requests.query';
import { GetTeamHandler } from './queries/get-team.query';
import typeorm from './typeorm';
import { GetUserStatsHandler } from './queries/get-user-stats.query';
const queries = [
  GetMyTeamsQueryHandler,
  GetSettingsHandler,
  GetTeamLeaveRequestsHandler,
  GetTeamHandler,
  GetUserStatsHandler,
];

const commands = [
  AddLeaveRequestHandler,
  CreateTeamHandler,
  UpdateTeamHandler,
  UpdateSettingsHandler,
  UpdateLeaveRequestHandler,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [typeorm] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow('typeorm'),
    }),
    CqrsModule.forRoot(),
    AuthModule,
    TypeOrmModule.forFeature([LeaveRequestEntity, SettingsEntity, TeamEntity]),
    GrpcModule,
  ],
  controllers: [TimeoffsController],
  providers: [
    ...queries,
    ...commands,
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
