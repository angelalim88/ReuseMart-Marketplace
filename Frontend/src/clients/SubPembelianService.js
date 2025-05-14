import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const apiSubPembelian = {
  getAllSubPembelian: async () => {
    const response = await apiClient.get(ENDPOINTS.GET_ALL_SUB_PEMBELIAN);
    return response.data;
  },
  getSubPembelianById: async (id) => {
    const response = await apiClient.get(ENDPOINTS.SHOW_SUB_PEMBELIAN(id));
    return response.data;
  },
  getSubPembelianByPembelianId: async (id_pembelian) => {
    const response = await apiClient.get(ENDPOINTS.GET_SUB_PEMBELIAN_BY_PEMBELIAN(id_pembelian));
    return response.data;
  },
  getSubPembelianByPembeliId: async (id_pembeli) => {
    const response = await apiClient.get(ENDPOINTS.GET_SUB_PEMBELIAN_BY_PEMBELI(id_pembeli));
    return response.data;
  },
  getSubPembelianByPenitipId: async (id_penitip) => {
    const response = await apiClient.get(ENDPOINTS.GET_SUB_PEMBELIAN_BY_PENITIP(id_penitip));
    return response.data;
  },
  createSubPembelian: async (data) => {
    const response = await apiClient.post(ENDPOINTS.CREATE_SUB_PEMBELIAN, data);
    return response.data;
  },
  updateSubPembelian: async (id, data) => {
    const response = await apiClient.put(ENDPOINTS.UPDATE_SUB_PEMBELIAN(id), data);
    return response.data;
  },
  deleteSubPembelian: async (id) => {
    const response = await apiClient.delete(ENDPOINTS.DELETE_SUB_PEMBELIAN(id));
    return response.data;
  }
};