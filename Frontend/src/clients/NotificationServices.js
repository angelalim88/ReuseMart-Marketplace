import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const SendNotification = async (data) => {
    const response = await apiClient.post(ENDPOINTS.SEND_NOTIFICATION, data);
    return response;
}

export const SendBulkNotification = async (data) => {
    const response = await apiClient.post(ENDPOINTS.SEND_BULK_NOTIFICATION, data);
    return response;
}