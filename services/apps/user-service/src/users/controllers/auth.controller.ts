import { Public } from '@app/auth/public.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCommand } from '../commands/auth/login.command';
import { RegisterCommand } from '../commands/auth/register.command';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenCommand } from '../commands/auth/refresh-token.command';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.commandBus.execute(new RegisterCommand(dto));
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.commandBus.execute(new LoginCommand(dto));
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return await this.commandBus.execute(
      new RefreshTokenCommand(dto.refreshToken),
    );
  }
}
