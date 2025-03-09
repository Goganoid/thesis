import { ApiException } from '@app/ddd';
import { SupabaseService } from '@app/user-service/common/supabase/supabase.service';
import { ICommand, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RefreshTokenCommand implements ICommand {
  constructor(public readonly refreshToken: string) {}
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
    if (response.error) {
      throw new ApiException('Failed to refresh token', 500);
    }
    return response.data;
  }
}
