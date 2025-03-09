import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsDto } from '../dto/setttings.dto';
import { SettingsEntity } from '../entities/settings.entity';

export class GetSettingsQuery extends Query<SettingsDto> {
  constructor() {
    super();
  }
}

@QueryHandler(GetSettingsQuery)
export class GetSettingsHandler implements IQueryHandler<GetSettingsQuery> {
  constructor(
    @InjectRepository(SettingsEntity)
    private readonly settingsRepository: Repository<SettingsEntity>,
  ) {}

  async execute() {
    const settings = await this.settingsRepository.findOneOrFail({});

    return {
      maxVacationDays: settings.maxVacationDays,
      maxSickDays: settings.maxSickDays,
    };
  }
}
