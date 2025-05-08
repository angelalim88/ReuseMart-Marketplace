import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllDonasiBarang = () =>
    apiClient.get(ENDPOINTS.GET_ALL_DONASI_BARANG);

export const GetDonasiBarangById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_DONASI_BARANG(id));

export const UpdateDonasiBarang = (id, data) =>
    apiClient.put(ENDPOINTS.UPDATE_DONASI_BARANG(id), data);

export const DeleteDonasiBarang = (id) =>
    apiClient.delete(ENDPOINTS.DELETE_DONASI_BARANG(id));

export const GetDonasiBarangByIdRequestDonasi = (id) =>
    apiClient.get(ENDPOINTS.SHOW_DONASI_BARANG_BY_REQUEST_PRODUK(id));

export const CreateDonasiBarang = (data) =>
    apiClient.post(ENDPOINTS.CREATE_DONASI_BARANG, data);