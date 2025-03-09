import { User, UserData } from '@app/auth';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CommandBus, CommandResult, QueryBus, QueryResult } from '@nestjs/cqrs';
import { CreateInvoiceCommand } from '../commands/invoices/create-invoice.command';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { GetInvoiceDataDto } from '../dto/get-invoice-data.dto';
import { GetAllInvoicesQuery } from '../queries/admin/get-all-invoices.query';
import { GetInvoicesQuery } from '../queries/user/get-invoice-data.query';
import { DeleteInvoiceCommand } from '../commands/invoices/delete-invoice.command';
import { GetCategoriesQuery } from '../queries/admin/get-categories.query';
import { UpdateInvoiceDto } from '../dto/update-invoice-dto';
import { UpdateInvoiceStatusCommand } from '../commands/invoices/update-invoice-status.command';
import { UserRole } from '@app/shared';
import { Roles } from '@app/auth/roles.guard';
import { CategoriesDto } from '../dto/categories.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getUserInvoices(
    @User() user: UserData,
    @Body() dto: GetInvoiceDataDto,
  ): Promise<QueryResult<GetInvoicesQuery>> {
    return await this.queryBus.execute(new GetInvoicesQuery({ user, dto }));
  }

  @Roles([UserRole.Admin, UserRole.Bookkeeper])
  @Get('admin/invoices')
  async getAllInvoices(
    @User() user: UserData,
    @Body() dto: GetInvoiceDataDto,
  ): Promise<QueryResult<GetAllInvoicesQuery>> {
    return await this.queryBus.execute(new GetAllInvoicesQuery({ user, dto }));
  }

  @Roles([UserRole.Admin, UserRole.Bookkeeper])
  @Get('admin/categories')
  async getCategories(): Promise<QueryResult<GetCategoriesQuery>> {
    return await this.queryBus.execute(new GetCategoriesQuery());
  }

  @Roles([UserRole.Admin, UserRole.Bookkeeper])
  @Put('admin/invoices/:id/status')
  async updateInvoiceStatus(
    @User() user: UserData,
    @Param('id') invoiceId: string,
    @Body() { status }: UpdateInvoiceDto,
  ): Promise<CommandResult<UpdateInvoiceStatusCommand>> {
    return await this.commandBus.execute(
      new UpdateInvoiceStatusCommand({ invoiceId, status, user }),
    );
  }

  @Post('invoices')
  async createInvoice(@User() user: UserData, @Body() dto: CreateInvoiceDto) {
    return await this.commandBus.execute(
      new CreateInvoiceCommand({ invoice: dto, userId: user.id }),
    );
  }

  @Delete('invoices/:id')
  async deleteInvoice(@User() user: UserData, @Param('id') invoiceId: string) {
    return await this.commandBus.execute(
      new DeleteInvoiceCommand({ invoiceId, user }),
    );
  }
}
