import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const apiKeranjang = {
    getKeranjangByIdPembeli: async (id) => {
        const response = await apiClient.get(ENDPOINTS.SHOW_KERANJANG_BY_ID_PEMBELI(id));
        return response.data;
    },
    createKeranjang: async (data) => {
        const response = await apiClient.post(ENDPOINTS.CREATE_KERANJANG, data);
        return response.data;
    },
    deleteKeranjang: async (id) => {
        const response = await apiClient.delete(ENDPOINTS.DELETE_KERANJANG(id));
        return response;
    }
}