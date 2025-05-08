import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const apiAlamatPembeli = {
    getAllAlamatPembeli: async () => {
        const response = await apiClient.get(ENDPOINTS.GET_ALL_ALAMAT_PEMBELI);
        return response.data;
    },
    getAlamatPembeliById: async (id) => {
        const response = await apiClient.get(ENDPOINTS.SHOW_ALAMAT_PEMBELI(id));
        return response.data;
    },
    getAlamatPembeliByIdPembeli: async (id) => {
        const response = await apiClient.get(ENDPOINTS.SEARCH_ALAMAT_PEMBELI_BY_PEMBELI(id));
        return response.data.alamat;
    },
    createAlamatPembeli: async (data) => {
        const response = await apiClient.post(ENDPOINTS.CREATE_ALAMAT_PEMBELI, data);
        return response.data;
    },
    updateAlamatPembeli: async (id, data) => {
        const response = await apiClient.put(ENDPOINTS.UPDATE_ALAMAT_PEMBELI(id), data);
        return response.data;
    },
    deleteAlamatPembeli: async (id) => {
        const response = await apiClient.delete(ENDPOINTS.DELETE_ALAMAT_PEMBELI(id));
        return response.data;
    }
};