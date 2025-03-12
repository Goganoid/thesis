export enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
  Manager = 'MANAGER',
  Bookkeeper = 'BOOKKEEPER',
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDataDto {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
}

export interface RefreshTokenDataDto {
  session: {
    access_token: string;
    refresh_token: string;
  };
}

export interface UserDataDto {
  id: string;
  email: string;
  role: UserRole;
}
