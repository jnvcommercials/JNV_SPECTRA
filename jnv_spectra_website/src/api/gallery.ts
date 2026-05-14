import axios from "axios";
import {
  API_BASE_URL,
  ENDPOINTS,
  DEFAULT_HEADERS,
  REQUEST_TIMEOUT,
  handleApiError,
} from "./config";

export interface GalleryItem {
  id: number;
  title: string;
  tagline: string;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface GalleryApiResponse {
  data: {
    data: GalleryItem[];
    count: number;
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  status: string;
}

export const getAllGalleryItems = async (): Promise<GalleryItem[] | null> => {
  try {
    const response = await axios.get<GalleryApiResponse>(
      `${API_BASE_URL}${ENDPOINTS.gallery}`,
      {
        headers: DEFAULT_HEADERS,
        timeout: REQUEST_TIMEOUT,
        params: {
          limit: 50,
        },
      }
    );

    return response.data.data.data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};
