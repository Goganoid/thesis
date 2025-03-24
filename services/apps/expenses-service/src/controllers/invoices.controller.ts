import { User, UserData } from '@app/auth';
import { Roles } from '@app/auth/roles.guard';
import { UserRole } from '@app/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, CommandResult, QueryBus, QueryResult } from '@nestjs/cqrs';
import { CreateInvoiceCommand } from '../commands/invoices/create-invoice.command';
import { DeleteInvoiceCommand } from '../commands/invoices/delete-invoice.command';
import { GeneratePresignedUrlCommand } from '../commands/invoices/generate-presigned-url.command';
import { UpdateInvoiceStatusCommand } from '../commands/invoices/update-invoice-status.command';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { GetInvoiceDataDto } from '../dto/get-invoice-data.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice-dto';
import { GetAllInvoicesQuery } from '../queries/admin/get-all-invoices.query';
import { GetCategoriesQuery } from '../queries/admin/get-categories.query';
import { GetInvoicesQuery } from '../queries/user/get-invoice-data.query';
import { UpdateCategoryLimitCommand } from '../commands/categories/update-category-limit.command';
import { UpdateLimitDto } from '../dto/update-limit.dto';
@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('presigned-url')
  async getPresignedUrl(
    @Body('fileType') fileType: string,
    @Body('hash') hash: string,
  ): Promise<CommandResult<GeneratePresignedUrlCommand>> {
    return await this.commandBus.execute(
      new GeneratePresignedUrlCommand(fileType, hash),
    );
  }

  @Get()
  async getUserInvoices(
    @User() user: UserData,
    @Query() dto: GetInvoiceDataDto,
  ): Promise<QueryResult<GetInvoicesQuery>> {
    return await this.queryBus.execute(new GetInvoicesQuery({ user, dto }));
  }

  @Roles([UserRole.Admin, UserRole.Bookkeeper])
  @Get('admin/invoices')
  async getAllInvoices(
    @User() user: UserData,
    @Query() dto: GetInvoiceDataDto,
  ): Promise<QueryResult<GetAllInvoicesQuery>> {
    return await this.queryBus.execute(new GetAllInvoicesQuery({ user, dto }));
  }

  @Roles([UserRole.Admin, UserRole.Bookkeeper])
  @Get('admin/categories')
  async getCategories(): Promise<QueryResult<GetCategoriesQuery>> {
    return await this.queryBus.execute(new GetCategoriesQuery());
  }

  @Roles([UserRole.Admin, UserRole.Bookkeeper])
  @Put('admin/categories/limits')
  async updateLimit(
    @User() user: UserData,
    @Body() { category, limit }: UpdateLimitDto,
  ): Promise<CommandResult<UpdateCategoryLimitCommand>> {
    return await this.commandBus.execute(
      new UpdateCategoryLimitCommand({ category, limit, user }),
    );
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
