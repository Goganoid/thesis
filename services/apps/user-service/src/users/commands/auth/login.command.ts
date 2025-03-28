import { SupabaseService } from '@app/user-service/common/supabase/supabase.service';
import {
  Command,
  CommandHandler,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { LoginDto } from '../../dto/login.dto';
import { ApiException } from '@app/ddd/types/api.exception';
import { LoginDataDto } from '../../dto/login-data.dto';

export class LoginCommand extends Command<LoginDataDto> {
  constructor(public readonly args: LoginDto) {
    super();
  }
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(private readonly supabaseService: SupabaseService) {}

  async execute(command: LoginCommand) {
    const { email, password } = command.args;
    const supabase = this.supabaseService.getClient();

    const {
      data: { user, session },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new ApiException(error.message);
    }

    if (!user || !session) {
      throw new ApiException('Invalid credentials');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new ApiException('User profile does not exist');
    }

    return {
      user: {
        id: user.id,
        email: user.email!,
        role: profile.role!,
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      },
    };
  }
}
