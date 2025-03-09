import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserData } from './user.type';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy) {
  public constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('AUTH_JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<UserData> {
    return {
      id: payload.sub,
      role: payload.user_role,
    };
  }

  authenticate(req) {
    super.authenticate(req);
  }
}
