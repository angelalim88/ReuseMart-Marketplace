import { apiClient } from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const GetAllBonusTopSeller = () =>
    apiClient.get(ENDPOINTS);

export const GetBonusTopSellerByIdPenitip = (id) =>
    apiClient.get(ENDPOINTS.SHOW_REVIEW_PRODUK(id));