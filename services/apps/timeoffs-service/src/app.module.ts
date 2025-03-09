import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequestEntity } from './entities/leave-request.entity';
import { SettingsEntity } from './entities/settings.entity';
import { TeamEntity } from './entities/team.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow('typeorm'),
    }),
    TypeOrmModule.forFeature([LeaveRequestEntity, SettingsEntity, TeamEntity]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
