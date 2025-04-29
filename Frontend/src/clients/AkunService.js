import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllAkun = () =>
    apiClient.get(ENDPOINTS.GET_ALL_AKUN);

export const GetAkunById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_AKUN(id));

export const CreateAkun = (data) =>
    apiClient.get(ENDPOINTS.CREATE_AKUN, data);
