import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { RegisterDto } from 'src/users/dto/register.dto';
import { OrganizationRepository } from 'src/users/repositories/organization.repository';

export class RegisterCommand implements ICommand {
  constructor(public readonly args: RegisterDto) {}
}

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(command: RegisterCommand) {
    const organization = await this.organizationRepository.getOrganization();
    organization.createUser({
      email: command.args.email,
      password: command.args.password,
    });
    await this.organizationRepository.save(organization);
  }
}
