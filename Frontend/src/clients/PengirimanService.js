import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllPengiriman = () =>
    apiClient.get(ENDPOINTS.GET_ALL_PENGIRIMAN);

export const GetPengirimanById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_PENGIRIMAN(id));

export const CreatePengiriman = (data) => 
  apiClient.post(ENDPOINTS.CREATE_PENGIRIMAN, data);
