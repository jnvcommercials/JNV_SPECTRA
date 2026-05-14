// src/api/sliders.ts

import axios from "axios";
import {
  API_BASE_URL,
  ENDPOINTS,
  DEFAULT_HEADERS,
  REQUEST_TIMEOUT,
  handleApiError,
} from "./config";

// Define the shape of a slider item
export interface SliderItem {
  id: string;
  slider_name: string;
  title: string;
  subtitle: string;
  content: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  order: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// API function to get all sliders
export const getAllSliders = async (): Promise<SliderItem[]> => {
  try {
    const response = await axios.get<SliderItem[]>(
      `${API_BASE_URL}${ENDPOINTS.sliders}`,
      {
        headers: DEFAULT_HEADERS,
        timeout: REQUEST_TIMEOUT,
        params: {
          status: "active", // filter only active sliders
          limit: 50,        // limit the number of sliders
        },
      }
    );

    return response.data || [];
  } catch (error) {
    handleApiError(error);
    return [];
  }
};
