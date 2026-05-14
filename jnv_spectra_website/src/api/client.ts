
// API client utility for making requests
import { API_BASE_URL, DEFAULT_HEADERS, handleApiError } from "./config";
import { ApiResponse } from "@/types";

/**
 * Generic API client for making HTTP requests
 */
class ApiClient {
  /**
   * Make a GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      // Add query parameters if they exist
      const url = new URL(API_BASE_URL + endpoint);
      
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
          }
        });
      }
      
      // Make the request
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: DEFAULT_HEADERS,
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  }
  
  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(API_BASE_URL + endpoint, {
        method: "POST",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
