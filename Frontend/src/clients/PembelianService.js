import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const apiPembelian = {
    getAllPembelian: async () => {
        const response = await apiClient.get(ENDPOINTS.GET_ALL_PEMBELIAN);
        return response.data;
    },
    getPembelianById: async (id) => {
        const response = await apiClient.get(ENDPOINTS.SHOW_PEMBELIAN(id));
        return response.data;
    },
    getPembelianByPembeliId: async (id) => {
        const response = await apiClient.get(ENDPOINTS.GET_PEMBELIAN_BY_PEMBELI(id));
        return response.data;
    },
    createPembelian: async (data) => {
        const response = await apiClient.post(ENDPOINTS.CREATE_PEMBELIAN, data);
        return response.data;
    },
    updatePembelian: async (id, data) => {
        const response = await apiClient.put(ENDPOINTS.UPDATE_PEMBELIAN(id), data);
        return response.data;
    },
    deletePembelian: async (id) => {
        const response = await apiClient.delete(ENDPOINTS.DELETE_PEMBELIAN(id));
        return response.data;
    }
};