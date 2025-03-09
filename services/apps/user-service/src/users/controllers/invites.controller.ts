import { User, UserData } from '@app/auth';
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateInviteCommand } from '../commands/invites/create-invite.command';
import { DeleteInviteCommand } from '../commands/invites/delete-invite.command';
import { CreateInviteDto } from '../dto/create-invite.dto';
import { DeleteInviteDto } from '../dto/delete-invite.dto';
import { GetInvitesQuery } from '../queries/invites/get-invites.query';
import { Roles, RolesGuard } from '@app/auth/roles.guard';
import { UserRole } from '@app/shared';

@Controller('invites')
@UseGuards(RolesGuard)
export class InvitesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Roles([UserRole.Admin])
  @Post()
  async createInvite(@Body() dto: CreateInviteDto) {
    return await this.commandBus.execute(new CreateInviteCommand(dto));
  }

  @Roles([UserRole.Admin])
  @Delete(':id')
  async deleteInvite(@Param() dto: DeleteInviteDto) {
    return await this.commandBus.execute(new DeleteInviteCommand(dto));
  }

  @Roles([UserRole.Admin])
  @Get()
  async getInvites(@User() user: UserData) {
    return await this.queryBus.execute(new GetInvitesQuery({ user }));
  }
}
