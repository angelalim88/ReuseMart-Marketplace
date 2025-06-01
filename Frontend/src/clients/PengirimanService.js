import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllPengiriman = () =>
    apiClient.get(ENDPOINTS.GET_ALL_PENGIRIMAN);

export const GetPengirimanById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_PENGIRIMAN(id));

export const CreatePengiriman = (data) => 
  apiClient.post(ENDPOINTS.CREATE_PENGIRIMAN, data);

export const UpdatePengirimanStatus = (id, status_pengiriman, tanggal_mulai, tanggal_berakhir) =>
  apiClient.put(ENDPOINTS.UPDATE_PENGIRIMAN(id), { status_pengiriman, tanggal_mulai, tanggal_berakhir });