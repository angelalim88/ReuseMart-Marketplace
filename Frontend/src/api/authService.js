import { apiClient } from "./apiClient";
import { ENDPOINTS } from "./endpoints";

export const authService = {
    register: (data) => apiClient.post(ENDPOINTS.REGISTER, data),
    login: async (data) => {
      const response = await apiClient.post(ENDPOINTS.LOGIN, data);
      const { token } = response.data;
    
      if (token) {
        console.log("Token diterima:", token);  // Log token yang diterima dari API
        localStorage.setItem("authToken", token);
      } else {
        throw new Error("Token tidak ditemukan di respons.");
      }
    
      return token;
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
