import { useQuery } from "@tanstack/react-query";
import { authApi } from "../../services/authApi";
import { UserDataDto } from "../../types/auth";

export const useUserData = () => {
  return useQuery<UserDataDto>({
    queryKey: ["userData"],
    queryFn: async () => {
      const response = await authApi.getUserData();
      return response;
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });
};
