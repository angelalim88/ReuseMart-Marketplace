import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllClaimMerchandise = () => 
  apiClient.get(ENDPOINTS.GET_ALL_CLAIM_MERCHANDISE);

export const GetClaimMerchandiseById = (id) => 
  apiClient.get(ENDPOINTS.SHOW_CLAIM_MERCHANDISE(id));

export const UpdateClaimMerchandise = (id, data) =>
    apiClient.put(ENDPOINTS.UPDATE_CLAIM_MERCHANDISE(id), data);