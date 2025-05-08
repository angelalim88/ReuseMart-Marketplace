import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const apiPembeli = {
    getAllPembeli: async () => {
        const response = await apiClient.get(ENDPOINTS.GET_ALL_PEMBELI);
        return response.data;
    },
    getPembeliById: async (id) => {
        const response = await apiClient.get(ENDPOINTS.SHOW_PEMBELI(id));
        return response.data;
    },
    getPembeliByIdAkun: async (id) => {
        const response = await apiClient.get(ENDPOINTS.SEARCH_PEMBELI_BY_AKUN(id));
        return response.data.pembeli;
    },
    createPembeli: async (data) => {
        const response = await apiClient.post(ENDPOINTS.CREATE_PEMBELI, data);
        return response.data;
    },
    updatePembeli: async (id, data) => {
        const response = await apiClient.put(ENDPOINTS.UPDATE_PEMBELI(id), data);
        return response.data;
    },
    deletePembeli: async (id) => {
        const response = await apiClient.delete(ENDPOINTS.DELETE_PEMBELI(id));
        return response.data;
    }
};