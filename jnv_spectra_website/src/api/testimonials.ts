import axios from "axios";
import {
  API_BASE_URL,
  ENDPOINTS,
  DEFAULT_HEADERS,
  REQUEST_TIMEOUT,
  handleApiError,
} from "./config";

export interface Testimonial {
  id: number;
  client_name: string;
  location: string;
  rating: number;
  feedback: string;
  featured_image_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TestimonialsApiResponse {
  data: {
    data: Testimonial[];
    count: number;
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  status: string;
}

export const getAllTestimonials = async (): Promise<Testimonial[] | null> => {
  try {
    const response = await axios.get<TestimonialsApiResponse>(
      `${API_BASE_URL}${ENDPOINTS.testimonials}`,
      {
        headers: DEFAULT_HEADERS,
        timeout: REQUEST_TIMEOUT,
        params: {
          status: "active", // Only fetch active testimonials
          limit: 50,        // Fetch up to 50 items
        },
      }
    );

    return response.data.data.data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};
