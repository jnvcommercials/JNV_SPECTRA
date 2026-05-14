import axios from "axios";
import {
  API_BASE_URL,
  ENDPOINTS,
  DEFAULT_HEADERS,
  REQUEST_TIMEOUT,
  handleApiError,
} from "./config";

// Define bullet point type for EventServices
// BulletPoint from API is actually { title: string, description: string }
export interface EventServicesBulletPoint {
  title: string;
  description: string;
}

// Allow bullet_points and additional_images to be array or object
export interface EventServiceItem {
  id: string;
  title: string;
  description: string;
  featured_image: string;
  additional_images: string[];
  bullet_points: EventServicesBulletPoint[];
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}


// API response type for EventServices
export interface EventServicesApiResponse {
  data: EventServiceItem[];
  count: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Fetch all EventServices
export const getAllEventServices = async (): Promise<EventServiceItem[] | null> => {
  try {
    const response = await axios.get<EventServicesApiResponse>(
      `${API_BASE_URL}${ENDPOINTS.eventService}`,
      {
        headers: DEFAULT_HEADERS,
        timeout: REQUEST_TIMEOUT,
        params: {
          status: "active", // Only fetch active rentals
          limit: 50,        // Fetch up to 50 items in one call
        },
      }
    );
    
    const normalizedData = response.data.data.map((item) => ({
      ...item,
      additional_images: Array.isArray(item.additional_images) ? item.additional_images : [],
      bullet_points: Array.isArray(item.bullet_points) ? item.bullet_points : [],
    }));

    return normalizedData;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};



export const getEventServiceById = async (id: string): Promise<EventServiceItem | null> => {
  try {
    const response = await axios.get<EventServiceItem>(
      `${API_BASE_URL}${ENDPOINTS.eventService}/${id}`,
      {
        headers: DEFAULT_HEADERS,
        timeout: REQUEST_TIMEOUT,
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};
