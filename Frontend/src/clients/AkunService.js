import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllAkun = async () => {
    const response = await apiClient.get(ENDPOINTS.GET_ALL_AKUN);
    return response.data
}

export const GetAkunById = async (id) => {
    const response = await apiClient.get(ENDPOINTS.SHOW_AKUN(id));
    return response.data;
}

export const CreateAkun = async (data) => {
    const response = await apiClient.get(ENDPOINTS.CREATE_AKUN, data);
    return response.data;
}

export const ChangePassword = async (id, data) => {
    const response = await apiClient.put(ENDPOINTS.CHANGE_PASSWORD(id), data);
    return response.data;
}

export const SendVerificationEmail = async (data) => {
    const response = await apiClient.post(ENDPOINTS.SEND_VERIFICATION_EMAIL, data);
    return response;
}