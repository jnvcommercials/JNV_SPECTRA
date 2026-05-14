import axios from "axios";
import {
  API_BASE_URL,
  ENDPOINTS,
  DEFAULT_HEADERS,
  REQUEST_TIMEOUT,
  handleApiError,
} from "./config";

// Define bullet point type for venues
export interface VenueBulletPoint {
  label: string;
  value: string;
}

// Define venue item structure
export interface VenueItem {
  id: string;
  title: string;
  description: string;
  featured_image: string;
  additional_images: string[];
  bullet_points: VenueBulletPoint[];
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  location: string;
  capacity: string;
  venue_type: string;
  space_preference: string;
  rating: number;
  // type:'venues'
}

// API response type for venues
export interface VenuesApiResponse {
  data: VenueItem[];
  count: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Fetch all venues
export const getAllVenues = async (): Promise<VenueItem[] | null> => {
  try {
    const response = await axios.get<VenuesApiResponse>(
      `${API_BASE_URL}${ENDPOINTS.venues}`, // Make sure `ENDPOINTS.venues` is defined
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

export const getVenueById = async (id: string): Promise<VenueItem | null> => {
  try {
    const response = await axios.get<VenueItem>(
      `${API_BASE_URL}${ENDPOINTS.venues}/${id}`,
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
