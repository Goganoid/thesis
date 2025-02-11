import { ICommand, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteInviteDto } from 'src/users/dto/delete-invite.dto';
import { OrganizationRepository } from 'src/users/repositories/organization.repository';

export class DeleteInviteCommand implements ICommand {
  constructor(public readonly args: DeleteInviteDto) {}
}

@CommandHandler(DeleteInviteCommand)
export class DeleteInviteHandler
  implements ICommandHandler<DeleteInviteCommand>
{
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(command: DeleteInviteCommand) {
    const organization = await this.organizationRepository.getOrganization();
    organization.deleteInvite(command.args.id);
    await this.organizationRepository.save(organization);
  }
}
