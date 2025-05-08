import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllReviewProduk = () => 
  apiClient.get(ENDPOINTS.GET_ALL_REVIEW_PRODUK);

export const GetReviewProdukById = (id) => 
  apiClient.get(ENDPOINTS.SHOW_REVIEW_PRODUK(id));

export const GetReviewProdukByIdTransaksi = (id) => 
  apiClient.get(`${ENDPOINTS.GET_REVIEW_BY_ID_TRANSAKSI}/${id}`);

export const GetReviewProdukByIdBarang = (id) => 
  apiClient.get(`${ENDPOINTS.GET_REVIEW_BY_ID_BARANG}/${id}`);

export const CreateReviewProduk = (data) => 
  apiClient.post(ENDPOINTS.CREATE_REVIEW_PRODUK, data);

export const UpdateReviewProduk = (id, data) =>
  apiClient.put(`${ENDPOINTS.UPDATE_REVIEW_PRODUK}/${id}`, data);

export const DeleteReviewProduk = (id) =>
  apiClient.delete(`${ENDPOINTS.DELETE_REVIEW_PRODUK}/${id}`);