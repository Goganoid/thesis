import {
  LoginDataDto,
  RefreshTokenDataDto,
  LoginDto,
  RegisterDto,
  UserDataDto,
} from "../types/auth";
import { userApiProvider } from "./api";

export const authApi = {
  login: async (data: LoginDto) => {
    const response = await userApiProvider.post<LoginDataDto>(
      "/auth/login",
      data
    );
    localStorage.setItem("accessToken", response.data.session.access_token);
    localStorage.setItem("refreshToken", response.data.session.refresh_token);
    return response.data;
  },

  register: async (data: RegisterDto) => {
    const response = await userApiProvider.post<unknown>(
      "/auth/register",
      data
    );
    return response.data;
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    const response = await userApiProvider.post<RefreshTokenDataDto>(
      "/auth/refresh-token",
      {
        refreshToken,
      }
    );
    localStorage.setItem("accessToken", response.data.session.access_token);
    localStorage.setItem("refreshToken", response.data.session.refresh_token);
    return response.data;
  },

  getUserData: async () => {
    const response = await userApiProvider.get<UserDataDto>("/auth/user-data");
    return response.data;
  },
};
