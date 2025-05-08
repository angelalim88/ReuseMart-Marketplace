import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllPembelian = () =>
    apiClient.get(ENDPOINTS.GET_ALL_PEMBELIAN);

export const GetPembelianById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_PEMBELIAN(id));