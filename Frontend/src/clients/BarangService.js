import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllBarang = () =>
    apiClient.get(ENDPOINTS.GET_ALL_BARANG);

export const GetBarangById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_BARANG(id));

export const GetAvailableBarangForDonation = () =>
    apiClient.get(ENDPOINTS.GET_AVAILABLE_BARANG_FOR_DONATION);

export const CreateBarang = (data) => 
    apiClient.post(ENDPOINTS.CREATE_BARANG, data);

export const UpdateBarang = (id, data) =>
    apiClient.put(ENDPOINTS.UPDATE_BARANG(id), data);

export const DeleteBarang = (id) =>
    apiClient.delete(ENDPOINTS.DELETE_BARANG(id));

export const GetAllBarangGaransi = () =>
    apiClient.get(ENDPOINTS.GET_ALL_BARANG_GARANSI);

