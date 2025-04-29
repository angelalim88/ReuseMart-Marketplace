import { apiClient } from "./apiClient";
import { ENDPOINTS } from "./endpoints";

export const authService = {
    register: (data) => apiClient.post(ENDPOINTS.CREATE_AKUN, data),
    login: async (data) => {
        const response = await apiClient.post(ENDPOINTS.LOGIN, data);
        const { token, user } = response.data;

        if (token) {
            localStorage.setItem("authToken", token);
        }
        return user;
    },
    forgotPassword: (data) => apiClient.post(ENDPOINTS.FORGOT_PASSWORD, data),
    logout: () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Token tidak tersedia.");
      }
      return apiClient.post(
        ENDPOINTS.LOGOUT,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).then(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("isLoggedIn");
      });
    },
    isAdmin: (user) => user.is_admin == true
};
