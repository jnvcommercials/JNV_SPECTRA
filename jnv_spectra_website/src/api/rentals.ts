import axios from "axios";
import {
  API_BASE_URL,
  ENDPOINTS,
  DEFAULT_HEADERS,
  REQUEST_TIMEOUT,
  handleApiError,
} from "./config";

export interface BulletPoint {
  key: string;
  value: string;
}

export interface RentalItem {
  id: string;
  title: string;
  description: string;
  featured_image: string;
  bullet_points: BulletPoint[];
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  gallery_images: string[];
}

export interface RentalsApiResponse {
  data: RentalItem[];
  count: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getAllRentals = async (): Promise<RentalItem[] | null> => {
  try {
    const response = await axios.get<RentalsApiResponse>(
      `${API_BASE_URL}${ENDPOINTS.rentals}`,
      {
        headers: DEFAULT_HEADERS,
        timeout: REQUEST_TIMEOUT,
        params: {
          status: "active", // Only fetch active rentals
          limit: 50,        // Fetch up to 50 items in one call
        },
      }
    );

    return response.data.data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};


