import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllTransaksi = () =>
    apiClient.get(ENDPOINTS.GET_ALL_TRANSAKSI);

export const GetTransaksiById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_TRANSAKSI(id));

export const GetTransaksiByIdPengiriman = (id) =>
    apiClient.get(ENDPOINTS.SHOW_TRANSAKSI(id));

export const CreateTransaksi = (data) =>
  apiClient.post(ENDPOINTS.CREATE_TRANSAKSI, {
    id_sub_pembelian: data.id_sub_pembelian,
    komisi_reusemart: data.komisi_reusemart,
    komisi_hunter: data.komisi_hunter,
    pendapatan: data.pendapatan,
    bonus_cepat: data.bonus_cepat,
  }, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });