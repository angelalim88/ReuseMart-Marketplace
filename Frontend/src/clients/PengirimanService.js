import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllPengiriman = () =>
    apiClient.get(ENDPOINTS.GET_ALL_PENGIRIMAN);

export const GetPengirimanById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_PENGIRIMAN(id));

export const CreatePengiriman = (data) => 
  apiClient.post(ENDPOINTS.CREATE_PENGIRIMAN, data);

export const UpdatePengirimanStatus = (id, data) =>
  apiClient.put(ENDPOINTS.UPDATE_PENGIRIMAN(id), {
    id_pembelian: data.id_pembelian,
    id_pengkonfirmasi: data.id_pengkonfirmasi,
    tanggal_mulai: data.tanggal_mulai,
    tanggal_berakhir: data.tanggal_berakhir,
    status_pengiriman: data.status_pengiriman,
    jenis_pengiriman: data.jenis_pengiriman || 'Ambil di gudang',
  });