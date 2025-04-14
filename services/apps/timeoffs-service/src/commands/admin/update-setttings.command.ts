import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateSettingsDto } from '../../dto/update-setttings.dto';
import { SettingsEntity } from '../../entities/settings.entity';

export class UpdateSettingsCommand extends Command<void> {
  constructor(public readonly dto: UpdateSettingsDto) {
    super();
  }
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
    await this.settingsRepository.update('primary', {
      maxSickDays: dto.maxSickDays,
      maxVacationDays: dto.maxVacationDays,
    });
  }
}
