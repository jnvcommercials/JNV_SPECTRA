import axios from "axios";
import {
  API_BASE_URL,
  ENDPOINTS,
  DEFAULT_HEADERS,
  REQUEST_TIMEOUT,
  handleApiError,
} from "./config";

// Define bullet point type for venues
export interface EventBulletPoint {
  label: string;
  value: string;
}

// Define venue item structure based on API response
export interface EventItem {
  id: string;
  title: string;
  description: string;
  pricing: string;
  featured_image: string;
  additional_images: string[];
  bullet_points: EventBulletPoint[];
  status: string;
  created_at: string;
  updated_at: string;
  // type:"events";
}

// API response type for venues
export interface EventsApiResponse {
  data: EventItem[];
  count: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Fetch all venues

export const getAllEvents = async (): Promise<EventItem[] | null> => {
  try {
    const response = await axios.get<EventsApiResponse>(
      `${API_BASE_URL}${ENDPOINTS.events}`, // Make sure ENDPOINTS.venues is defined
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

export const getEventById = async (id: string): Promise<EventItem | null> => {
  try {
    const response = await axios.get<EventItem>(
      `${API_BASE_URL}${ENDPOINTS.events}/${id}`,
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

