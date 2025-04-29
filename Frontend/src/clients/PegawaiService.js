import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllPegawai = () =>
    apiClient.get(ENDPOINTS.GET_ALL_PEGAWAI);

export const GetPegawaiById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_PEGAWAI(id));

export const CreatePegawai = (data) => {
    return apiClient.post(ENDPOINTS.CREATE_PEGAWAI, data);
};
export const UpdatePegawai = (id, pegawaiData) =>
    apiClient.put(ENDPOINTS.UPDATE_PEGAWAI(id), pegawaiData);

export const DeletePegawai = (id) =>
    apiClient.delete(ENDPOINTS.DELETE_PEGAWAI(id));

export const GetAkunByPegawaiId = (id) =>
    apiClient.get(`${ENDPOINTS.SHOW_PEGAWAI(id)}/akun`);

export const UpdateAkunByPegawaiId = (id, akunData) =>
    apiClient.put(`${ENDPOINTS.UPDATE_PEGAWAI(id)}/akun`, akunData);