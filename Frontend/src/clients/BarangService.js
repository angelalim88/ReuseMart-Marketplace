import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllBarang = () =>
    apiClient.get(ENDPOINTS.GET_ALL_BARANG);

export const GetBarangById = (id) =>
    apiClient.get(ENDPOINTS.SHOW_BARANG(id));

export const GetAvailableBarangForDonation = () =>
    apiClient.get(ENDPOINTS.GET_AVAILABLE_BARANG_FOR_DONATION);

export const CreateBarang = (data) => 
    apiClient.post(ENDPOINTS.CREATE_BARANG, data);

export const UpdateBarang = (id, data) => {
    console.log('Updating barang with id:', id, 'and data:', data);
    
    // Log FormData contents untuk debugging
    if (data instanceof FormData) {
        console.log('FormData contents:');
        for (let [key, value] of data.entries()) {
            console.log(`${key}:`, value);
        }
    }
    
    return apiClient.put(ENDPOINTS.UPDATE_BARANG(id), data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 30000 // 30 detik untuk upload
    });
};

export const DeleteBarang = (id) =>
    apiClient.delete(ENDPOINTS.DELETE_BARANG(id));

export const GetAllBarangGaransi = () =>
    apiClient.get(ENDPOINTS.GET_ALL_BARANG_GARANSI);

