import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllPenitip = () =>
    apiClient.get(ENDPOINTS.GET_ALL_PENITIP);

export const GetPenitipById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_PENITIP(id));