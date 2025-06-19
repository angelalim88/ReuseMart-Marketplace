import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllPenitipan = () =>
    apiClient.get(ENDPOINTS.GET_ALL_PENITIPAN);

export const GetPenitipanById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_PENITIPAN(id));

export const UpdatePenitipan = (id, data) =>
    apiClient.put(ENDPOINTS.UPDATE_PENITIPAN(id), data);

export const DeletePenitipan = (id) =>
    apiClient.delete(ENDPOINTS.DELETE_PENITIPAN(id));

export const UpdateStatusPenitipan = (id, newStatus) => {
    return apiClient.put(ENDPOINTS.UPDATE_PENITIPAN(id), { status_penitipan: newStatus });
};

export const CreatePenitipan = (data) => 
    apiClient.post(ENDPOINTS.CREATE_PENITIPAN, data);

export const GetPenitipanByIdBarang = (id) =>
    apiClient.get(ENDPOINTS.GET_PENITIPAN_BY_BARANG(id));

export const GetAllPenitipanByIdPenitip = (id) =>
    apiClient.get(ENDPOINTS.GET_ALL_PENITIPAN_BY_ID_PENITIP(id));

export const GetItemForScheduling = (id) =>
  apiClient.get(ENDPOINTS.ITEM_FOR_SCHEDULING(id));

export const ConfirmReceipt = (id) =>
  apiClient.patch(ENDPOINTS.CONFIRM_RECEIPT(id));

export const SchedulePickup = (id, data) =>
  apiClient.put(ENDPOINTS.SCHEDULE_PICKUP(id), data);

export const GetPenitipanByStatus = (status) =>
  apiClient.get(ENDPOINTS.GET_PENITIPAN_BY_STATUS(status));