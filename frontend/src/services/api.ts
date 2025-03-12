import axios, { AxiosError, AxiosInstance } from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { RefreshTokenDataDto } from "../types/auth";

interface FailedRequest {
  response: {
    config: {
      headers: {
        Authorization: string;
      };
    };
  };
}

export const userApiProvider = axios.create({
  baseURL: import.meta.env.VITE_USER_API_URL,
});

export const expensesApiProvider = axios.create({
  baseURL: import.meta.env.VITE_EXPENSE_API_URL,
});

const refreshAuthLogic = async (failedRequest: FailedRequest) => {
  try {
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
    const {
      session: { access_token, refresh_token: new_refresh_token },
    } = response.data;

    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", new_refresh_token);

    failedRequest.response.config.headers.Authorization = `Bearer ${access_token}`;
    return Promise.resolve();
  } catch (error) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    return Promise.reject(error);
  }
};

const applyInterceptors = (api: AxiosInstance) => {
  // Add request interceptor to add Authorization header
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Add response interceptor to handle 401 errors
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (
        error.response?.status === 401 &&
        error.config?.url !== "/auth/refresh-token"
      ) {
        // Let axios-auth-refresh handle the token refresh
        return Promise.reject(error);
      }
      return Promise.reject(error);
    }
  );

  // Attach the refresh token logic to axios instance
  createAuthRefreshInterceptor(api, refreshAuthLogic, {
    statusCodes: [401], // default: [401]
    pauseInstanceWhileRefreshing: true, // default: false
  });
};

applyInterceptors(userApiProvider);
applyInterceptors(expensesApiProvider);
