import { AuthModule } from '@app/auth/auth.module';
import { JwtAuthGuard } from '@app/auth/jwt.auth.guard';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpdateCategoryLimitHandler } from './commands/categories/update-category-limit.command';
import { CreateInvoiceHandler } from './commands/invoices/create-invoice.command';
import { DeleteInvoiceHandler } from './commands/invoices/delete-invoice.command';
import { UpdateInvoiceStatusHandler } from './commands/invoices/update-invoice-status.command';
import { InvoicesController } from './controllers/invoices.controller';
import { CategoryEntity } from './entities/category.entity';
import { InvoiceEntity } from './entities/invoice.entity';
import { GetAllInvoicesHandler } from './queries/admin/get-all-invoices.query';
import { GetCategoriesHandler } from './queries/admin/get-categories.query';
import { GetInvoicesHandler } from './queries/user/get-invoice-data.query';
import typeorm from './typeorm';

const commands = [
  UpdateCategoryLimitHandler,
  CreateInvoiceHandler,
  DeleteInvoiceHandler,
  UpdateInvoiceStatusHandler,
];

const queries = [
  GetInvoicesHandler,
  GetCategoriesHandler,
  GetAllInvoicesHandler,
];
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [typeorm] }),
    CqrsModule.forRoot(),
    AuthModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow('typeorm'),
    }),
    TypeOrmModule.forFeature([CategoryEntity, InvoiceEntity]),
  ],
  controllers: [InvoicesController],
  providers: [
    ...commands,
    ...queries,
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => {
        return new JwtAuthGuard(reflector);
      },
      inject: [Reflector],
    },
  ],
})
export class AppModule {}
