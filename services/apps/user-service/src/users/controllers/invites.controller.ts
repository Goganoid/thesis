import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateInviteCommand } from '../commands/invites/create-invite.command';
import { DeleteInviteCommand } from '../commands/invites/delete-invite.command';
import { CreateInviteDto } from '../dto/create-invite.dto';
import { DeleteInviteDto } from '../dto/delete-invite.dto';
import { GetInvitesQuery } from '../queries/invites/get-invites.query';

@Controller('invites')
export class InvitesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createInvite(@Body() dto: CreateInviteDto) {
    return await this.commandBus.execute(new CreateInviteCommand(dto));
  }

  @Delete(':id')
  async deleteInvite(@Param() dto: DeleteInviteDto) {
    return await this.commandBus.execute(new DeleteInviteCommand(dto));
  }

  @Get()
  async getInvites() {
    return await this.queryBus.execute(new GetInvitesQuery());
  }
}
