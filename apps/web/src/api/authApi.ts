import { api } from "../lib/api";

export const authApi = {
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.post(
      "/auth/change-password",
      data
    );

    return response.data;
  },
};