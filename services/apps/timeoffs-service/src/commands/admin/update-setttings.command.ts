import { ICommand, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Repository } from 'typeorm';

import { UpdateSettingsDto } from '../../dto/update-setttings.dto';
import { SettingsEntity } from '../../entities/settings.entity';
import { InjectRepository } from '@nestjs/typeorm';

export class UpdateSettingsCommand implements ICommand {
  constructor(public readonly dto: UpdateSettingsDto) {}
}

@CommandHandler(UpdateSettingsCommand)
export class UpdateSettingsHandler
  implements ICommandHandler<UpdateSettingsCommand>
{
  constructor(
    @InjectRepository(SettingsEntity)
    private readonly settingsRepository: Repository<SettingsEntity>,
  ) {}

  async execute({ dto }: UpdateSettingsCommand) {
    const settings = await this.settingsRepository.findOneOrFail({});

    await this.settingsRepository.update(settings.id, {
      maxSickDays: dto.maxSickDays,
      maxVacationDays: dto.maxVacationDays,
    });
  }
}
