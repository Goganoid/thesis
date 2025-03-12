import { ApiException } from '@app/ddd';
import { SupabaseService } from '@app/user-service/common/supabase/supabase.service';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginDataDto } from '../../dto/login-data.dto';
import { RefreshTokenDataDto } from '../../dto/refresh-tokend-data.dto';

export class RefreshTokenCommand extends Command<RefreshTokenDataDto> {
  constructor(public readonly refreshToken: string) {
    super();
  }
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(private readonly supabaseService: SupabaseService) {}

  async execute({ refreshToken }: RefreshTokenCommand) {
    const response = await this.supabaseService
      .getClient()
      .auth.refreshSession({ refresh_token: refreshToken });
    if (response.error || !response.data.session) {
      throw new ApiException('Failed to refresh token', 500);
    }
    const { session } = response.data;
    return {
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      },
    };
  }
}
