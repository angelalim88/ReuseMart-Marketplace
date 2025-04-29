import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllBarang = () =>
    apiClient.get(ENDPOINTS.GET_ALL_BARANG);

export const GetBarangById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_BARANG(id));

// export const UpdateUserAuction = (id, data) =>
//   apiClient.put(ENDPOINTS.ADMIN_UPDATE_AUCTION(id), data);

// export const UpdateUserStatus = (id, data) =>
//   apiClient.put(ENDPOINTS.ADMIN_UPDATE_USER_STATUS(id), data);

// export const DeleteUser = (id) =>
//   apiClient.delete(ENDPOINTS.ADMIN_DELETE_USER(id));