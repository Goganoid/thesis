import { ICommand, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateInviteDto } from 'src/users/dto/create-invite.dto';
import { OrganizationRepository } from 'src/users/repositories/organization.repository';

export class CreateInviteCommand implements ICommand {
  constructor(public readonly args: CreateInviteDto) {}
}

@CommandHandler(CreateInviteCommand)
export class CreateInviteHandler
  implements ICommandHandler<CreateInviteCommand>
{
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(command: CreateInviteCommand) {
    const organization = await this.organizationRepository.getOrganization();
    organization.createInvite(command.args.email, command.args.role);
    await this.organizationRepository.save(organization);
  }
}
