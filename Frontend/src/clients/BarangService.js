import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllBarang = () =>
    apiClient.get(ENDPOINTS.GET_ALL_BARANG);

export const GetBarangById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_BARANG(id));

export const GetAvailableBarangForDonation = () =>
    apiClient.get(ENDPOINTS.GET_AVAILABLE_BARANG_FOR_DONATION);