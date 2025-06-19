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

export const UpdatePoinPembeli = async (id_pembeli, tambahan_poin) => {
  try {
    // Ambil data pembeli saat ini
    const currentPembeli = await apiPembeli.getPembeliById(id_pembeli);
    const currentPoin = parseInt(currentPembeli.pembeli.total_poin || 0);
    
    // Hitung poin baru
    const newPoin = currentPoin + parseInt(tambahan_poin);
    
    // Update poin pembeli menggunakan endpoint khusus
    const response = await apiClient.put(ENDPOINTS.UPDATE_POIN_PEMBELI(id_pembeli), { 
      total_poin: newPoin 
    });
    return response.data;
  } catch (error) {
    console.error('Error updating poin pembeli:', error);
    throw error;
  }
};
