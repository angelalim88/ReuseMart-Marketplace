import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllDiskusiProduk = () => 
  apiClient.get(ENDPOINTS.GET_ALL_DISKUSI_PRODUK);

export const GetDiskusiProdukById = (id) => 
  apiClient.get(ENDPOINTS.SHOW_DISKUSI_PRODUK(id));

export const GetDiskusiProdukByIdBarang = (id) => 
  apiClient.get(`${ENDPOINTS.GET_DISKUSI_BY_ID_BARANG}/${id}`);

export const CreateDiskusiProduk = (data) => 
  apiClient.post(ENDPOINTS.CREATE_DISKUSI_PRODUK, data);

export const UpdateDiskusiProduk = (id, data) =>
  apiClient.put(`${ENDPOINTS.UPDATE_DISKUSI_PRODUK}/${id}`, data);

export const DeleteDiskusiProduk = (id) =>
  apiClient.delete(`${ENDPOINTS.DELETE_DISKUSI_PRODUK}/${id}`);