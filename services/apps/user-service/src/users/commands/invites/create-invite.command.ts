import { ICommand, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateInviteDto } from '../../dto/create-invite.dto';
import { OrganizationRepository } from '../../repositories/organization.repository';
import * as postmark from 'postmark';
import { ConfigService } from '@nestjs/config';
import { generateInviteEmail } from '../../helpers/generateInviteEmail';
export class CreateInviteCommand implements ICommand {
  constructor(public readonly args: CreateInviteDto) {}
}

@CommandHandler(CreateInviteCommand)
export class CreateInviteHandler
  implements ICommandHandler<CreateInviteCommand>
{
  private readonly postmarkClient = new postmark.ServerClient(
    this.configService.getOrThrow<string>('POSTMARK_API_KEY'),
  );
  private readonly frontendUrl =
    this.configService.getOrThrow<string>('FRONTEND_URL');

  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: CreateInviteCommand) {
    const organization = await this.organizationRepository.getOrganization();
    organization.createInvite(command.args.email, command.args.role);
    await this.organizationRepository.save(organization);
    try {
      await this.sendInviteEmail(command.args.email);
    } catch (error) {
      console.error('Failed to send invite email', error);
    }
  }

  async sendInviteEmail(email: string) {
    const link = `${this.frontendUrl}/register`;
    const html = await generateInviteEmail({ link });
    await this.postmarkClient.sendEmail({
      From: 'noreply@expenses.com',
      To: email,
      Subject: 'Invitation to join Expense Manager',
      HtmlBody: html,
    });
  }
}
