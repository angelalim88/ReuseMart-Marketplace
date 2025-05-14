import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllPegawai = () =>
    apiClient.get(ENDPOINTS.GET_ALL_PEGAWAI);

export const GetPegawaiById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_PEGAWAI(id));

export const CreatePegawai = (data) => {
    if (!(data instanceof FormData)) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'profile_picture' && data[key] instanceof File) {
                formData.append(key, data[key]);
            } else if (typeof data[key] === 'object' && data[key] !== null && !(data[key] instanceof File)) {
                Object.keys(data[key]).forEach(nestedKey => {
                    formData.append(nestedKey, data[key][nestedKey]);
                });
            } else {
                formData.append(key, data[key]);
            }
        });
        data = formData;
    }
    
    return apiClient.post(ENDPOINTS.CREATE_PEGAWAI, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const UpdatePegawai = (id, pegawaiData) => {
    if (!(pegawaiData instanceof FormData)) {
        const formData = new FormData();
        if (pegawaiData.nama_pegawai) formData.append('nama_pegawai', pegawaiData.nama_pegawai);
        if (pegawaiData.tanggal_lahir) formData.append('tanggal_lahir', pegawaiData.tanggal_lahir);

        if (pegawaiData.akun) {
            if (pegawaiData.akun.email) formData.append('email', pegawaiData.akun.email);
            if (pegawaiData.akun.role) formData.append('role', pegawaiData.akun.role);
            if (pegawaiData.akun.password) formData.append('password', pegawaiData.akun.password);
        }
        
        if (pegawaiData.profile_picture instanceof File) {
            formData.append('profile_picture', pegawaiData.profile_picture);
        }
        
        pegawaiData = formData;
    }
    
    return apiClient.put(ENDPOINTS.UPDATE_PEGAWAI(id), pegawaiData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const DeletePegawai = (id) =>
    apiClient.delete(ENDPOINTS.DELETE_PEGAWAI(id));

export const GetAkunByPegawaiId = (id) =>
    apiClient.get(`${ENDPOINTS.SHOW_PEGAWAI(id)}/akun`);

export const UpdateAkunByPegawaiId = (id, akunData) =>
    apiClient.put(`${ENDPOINTS.UPDATE_PEGAWAI(id)}/akun`, akunData);

export const GetPegawaiByAkunId = (id) =>
    apiClient.get(ENDPOINTS.SEARCH_PEGAWAI_BY_AKUN(id));