import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllOrganisasiAmal = () =>
    apiClient.get(ENDPOINTS.GET_ALL_ORGANISASI_AMAL);

export const GetOrganisasiAmalById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_ORGANISASI_AMAL(id));

export const GetOrganisasiAmalByAkun = (id) =>
    apiClient.get(ENDPOINTS.GET_ORGANISASI_AMAL_BY_AKUN(id));

export const UpdateOrganisasiAmal = (id, formData) => {
    const response = apiClient.put(ENDPOINTS.UPDATE_ORGANISASI_AMAL(id), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
    }).then(response => {
        return response.data;
    }).catch(error => {
        console.error("Gagal mengupdate data organisasi amal:", error);
        throw error; 
    });
    return response;
}

export const DeleteOrganisasiAmal = (id) =>
    apiClient.delete(ENDPOINTS.DELETE_ORGANISASI_AMAL(id));

export const CreateOrganisasiAmal = (data) =>
    apiClient.post(ENDPOINTS.CREATE_ORGANISASI_AMAL, data);