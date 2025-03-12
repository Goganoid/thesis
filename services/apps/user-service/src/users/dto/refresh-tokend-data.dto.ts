export class RefreshTokenDataDto {
  session: {
    access_token: string;
    refresh_token: string;
  };
}
