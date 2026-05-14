import { toast } from "@/hooks/use-toast";
import { getToken } from "@/api/auth";

// Base URL for all API requests
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Use environment variable for API base URL, with a fallback to localhost:8000
// Make sure to set VITE_API_BASE_URL in your .env file

// Common headers for API requests
export const getHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    // Get token from localStorage
    const token = getToken();
    console.log("Auth token for API request:", token);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("No authentication token found");
    }
  }

  return headers;
};

// Handle API errors
export const handleApiError = (error: any) => {
  console.error("API Error:", error);
  
  let errorMessage = "An unexpected error occurred. Please try again.";
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = "No response received from server. Please check your connection.";
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message || errorMessage;
  }
  
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
  
  return Promise.reject(error);
};

// Generic fetch wrapper with error handling
export const fetchApi = async (endpoint: string, options?: RequestInit) => {
  try {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`[fetchApi] Requesting: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options?.headers || {}),
      }
    });

    console.log(`[fetchApi] Response status: ${response.status}`);
    
    if (response.status === 401 || response.status === 403) {
      // Unauthorized or Forbidden - redirect to login
      console.error('Authentication error detected, redirecting to login');
      localStorage.removeItem("token");
      localStorage.removeItem("admin_session");
      localStorage.removeItem("profile");
      
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
      
      throw {
        response: {
          status: response.status,
          statusText: "Authentication failed. Please log in again.",
          data: { message: "Authentication failed" },
        },
      };
    }
    
    // Handle 204 No Content responses
    if (response.status === 204) {
      return { data: null };
    }
    
    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { data: null };
    }
    
    const data = await response.json();
    
    // Ensure consistent response structure
    if (data && !data.data) {
      return { data };
    }
    
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Helper function to upload files
export const uploadFile = async (endpoint: string, file: File, formDataName = 'file') => {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const formData = new FormData();
    
    console.log(`Uploading file to ${url}`);
    console.log(`Form field name: ${formDataName}`);
    console.log(`File:`, file);
    
    // Add the file with the specified field name
    formData.append(formDataName, file);
    
    for (const pair of formData.entries()) {
      console.log(`FormData contains: ${pair[0]}, ${pair[1]}`);
    }
    
    // Get authentication headers but don't include Content-Type
    const headers = getHeaders(true);
    // Don't set Content-Type for multipart/form-data
    delete headers["Content-Type"]; 
    
    console.log(`Headers:`, headers);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    console.log(`Upload response status: ${response.status}`);
    
    if (!response.ok) {
      let errorMessage = "Upload failed";
      try {
        const errorData = await response.json();
        console.error(`Error response:`, errorData);
        errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      } catch (e) {
        if (e instanceof Error) {
          throw e;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    }

    const responseData = await response.json();
    console.log(`Upload successful:`, responseData);
    return responseData;
  } catch (error) {
    console.error(`Upload error:`, error);
    return handleApiError(error);
  }
};

// Helper function to upload multiple files
export const uploadMultipleFiles = async (endpoint: string, files: File[], formDataName = 'files') => {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`${formDataName}`, file); // Use the formDataName directly without index
    });
    
    // Get authentication headers but don't include Content-Type
    const headers = getHeaders(true);
    delete headers["Content-Type"]; // Remove content-type so browser can set it with boundary
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        response: {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        },
      };
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};
