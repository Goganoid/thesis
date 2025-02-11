import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCommand } from '../commands/auth/login.command';
import { RegisterCommand } from '../commands/auth/register.command';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.commandBus.execute(new RegisterCommand(dto));
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.commandBus.execute(new LoginCommand(dto));
  }
}
