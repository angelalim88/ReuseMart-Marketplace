import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllRequestDonasi = () =>
    apiClient.get(ENDPOINTS.GET_ALL_REQUEST_DONASI);

export const GetRequestDonasiById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_REQUEST_DONASI(id));

export const UpdateRequestDonasi = (id, data) =>
    apiClient.put(ENDPOINTS.UPDATE_REQUEST_DONASI(id), data);

export const DeleteRequestDonasi = (id) =>
    apiClient.delete(ENDPOINTS.DELETE_REQUEST_DONASI(id));

export const UpdateStatusRequestDonasi = (id, newStatus) => {
    return apiClient.put(ENDPOINTS.UPDATE_REQUEST_DONASI(id), { status_request: newStatus });
};

export const GetRequestDonasiByOrganisasi = (id) =>
    apiClient.get(ENDPOINTS.GET_REQUEST_DONASI_BY_ORGANISASI(id));

export const AddRequestDonasi = (data) => {
    return apiClient.post(ENDPOINTS.CREATE_REQUEST_DONASI, data);
};
    
