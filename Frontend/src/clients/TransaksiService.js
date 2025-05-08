import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllTransaksi = () =>
    apiClient.get(ENDPOINTS.GET_ALL_TRANSAKSI);

export const GetTransaksiById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_TRANSAKSI(id));

export const GetTransaksiByIdPengiriman = (id) =>
    apiClient.get(ENDPOINTS.SHOW_TRANSAKSI(id));