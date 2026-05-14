import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, uploadFile, uploadMultipleFiles } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { retry, debounce } from "@/lib/utils";
import { useCallback, useRef } from "react";

interface RentalFormValues {
  title: string;
  description: string;
  category: string;
  rental_type: string;
  featured_image?: string;
  gallery_images?: string[];
  bullet_points: Array<{
    key: string;
    value: string;
  }>;
  availability: boolean;
  status: "active" | "inactive";
}

interface RentalListParams {
  page?: number;
  limit?: number;
  category?: string;
  rental_type?: string;
  status?: string;
  availability?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  max: 60, // 60 requests per minute
  message: "Too many requests, please try again later",
};

// Cache configuration
const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
};

// Convert form values to API format
const formatRentalData = (values: RentalFormValues) => {
  return {
    title: values.title,
    description: values.description,
    category: values.category,
    rental_type: values.rental_type,
    featured_image: values.featured_image,
    gallery_images: values.gallery_images || [],
    bullet_points: values.bullet_points || [],
    availability: values.availability,
    status: values.status,
  };
};

// Fetch rentals list with enhanced caching and rate limiting
export const useRentals = (params: RentalListParams = {}) => {
  const queryParams = new URLSearchParams();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.category) queryParams.append("category", params.category);
  if (params.rental_type) queryParams.append("rental_type", params.rental_type);
  if (params.status) queryParams.append("status", params.status);
  if (params.availability !== undefined) queryParams.append("availability", params.availability.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.search) queryParams.append("search", params.search);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  console.log(`[useRentals] Making request to: /api/v1/rentals${queryString}`);
  
  return useQuery({
    queryKey: ["rentals", params],
    queryFn: async () => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      try {
        console.log(`[useRentals] Fetching data from: /api/v1/rentals${queryString}`);
        const response = await fetchApi(`/api/v1/rentals${queryString}`, {
          signal: abortControllerRef.current.signal,
        });
        
        // If response is error or not valid, throw immediately
        if (!response || response.error) {
          const error = response?.error || "Invalid response from server";
          console.error(`[useRentals] API error:`, error);
          throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
        }
        
        console.log(`[useRentals] API response:`, response);
        
        return response;
      } catch (error) {
        console.error(`[useRentals] Error fetching rentals:`, error);
        throw error; // Ensure the error is propagated
      }
    },
    retry: 1, // Only retry once
    staleTime: CACHE_CONFIG.staleTime,
    gcTime: CACHE_CONFIG.gcTime,
  });
};

// Create a new rental with optimistic updates
export const useCreateRental = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RentalFormValues) => {
      const formattedData = formatRentalData(data);
      return fetchApi("/api/v1/rentals", {
        method: "POST",
        body: JSON.stringify(formattedData),
      });
    },
    onMutate: async (newRental) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["rentals"] });
      
      // Snapshot the previous value
      const previousRentals = queryClient.getQueryData(["rentals"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["rentals"], (old: any) => {
        const newData = {
          ...old,
          data: [...(old?.data || []), { ...newRental, id: "temp" }],
        };
        return newData;
      });
      
      return { previousRentals };
    },
    onError: (err, newRental, context) => {
      // Revert to the previous value on error
      if (context?.previousRentals) {
        queryClient.setQueryData(["rentals"], context.previousRentals);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to create rental",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
    },
  });
};

// Update an existing rental with optimistic updates
export const useUpdateRental = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RentalFormValues) => {
      const formattedData = formatRentalData(data);
      return fetchApi(`/api/v1/rentals/${id}`, {
        method: "PUT",
        body: JSON.stringify(formattedData),
      });
    },
    onMutate: async (updatedRental) => {
      await queryClient.cancelQueries({ queryKey: ["rentals"] });
      await queryClient.cancelQueries({ queryKey: ["rentals", id] });
      
      const previousRentals = queryClient.getQueryData(["rentals"]);
      const previousRental = queryClient.getQueryData(["rentals", id]);
      
      queryClient.setQueryData(["rentals", id], updatedRental);
      queryClient.setQueryData(["rentals"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((rental: any) =>
            rental.id === id ? { ...rental, ...updatedRental } : rental
          ),
        };
      });
      
      return { previousRentals, previousRental };
    },
    onError: (err, updatedRental, context) => {
      if (context?.previousRentals) {
        queryClient.setQueryData(["rentals"], context.previousRentals);
      }
      if (context?.previousRental) {
        queryClient.setQueryData(["rentals", id], context.previousRental);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to update rental",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["rentals", id] });
    },
  });
};

// Delete a rental with optimistic updates
export const useDeleteRental = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => {
      return fetchApi(`/api/v1/rentals/${id}`, {
        method: "DELETE",
      });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["rentals"] });
      
      const previousRentals = queryClient.getQueryData(["rentals"]);
      
      queryClient.setQueryData(["rentals"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((rental: any) => rental.id !== id),
        };
      });
      
      return { previousRentals };
    },
    onError: (err, id, context) => {
      if (context?.previousRentals) {
        queryClient.setQueryData(["rentals"], context.previousRentals);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to delete rental",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
    },
  });
};

// Upload featured image with progress tracking
export const useUploadRentalFeaturedImage = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => {
      console.log(`Starting upload for rental ID: ${id}`);
      console.log(`File to upload:`, file);
      
      if (!id) {
        console.error("Missing rental ID for upload");
        throw new Error("Rental ID is required for image upload");
      }
      
      console.log(`Uploading to: /api/v1/rentals/${id}/upload-image`);
      return uploadFile(`/api/v1/rentals/${id}/upload-image`, file, "image");
    },
    onSuccess: (data: any) => {
      console.log(`Upload success, response:`, data);
      
      queryClient.invalidateQueries({ queryKey: ["rentals", id] });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      
      toast({
        title: "Success",
        description: "Featured image uploaded successfully",
      });
      
      // Primary format based on actual API response
      if (data?.data?.featured_image) {
        return data.data.featured_image;
      }
      
      // Fallback for other formats
      const imageUrl = 
        (typeof data === 'string' ? data : null) ||
        data?.data?.imageUrl ||
        data?.imageUrl || 
        data?.featured_image;
      
      return imageUrl;
    },
    onError: (error: any) => {
      console.error(`Upload error:`, error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload featured image",
        variant: "destructive",
      });
    },
  });
};

// Upload gallery images with progress tracking
export const useUploadRentalGalleryImages = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (files: File[]) => {
      console.log(`Starting gallery upload for rental ID: ${id}`);
      console.log(`Files to upload:`, files);
      
      if (!id) {
        console.error("Missing rental ID for upload");
        throw new Error("Rental ID is required for image upload");
      }
      
      console.log(`Uploading to: /api/v1/rentals/${id}/upload-images`);
      return uploadMultipleFiles(`/api/v1/rentals/${id}/upload-images`, files, "images");
    },
    onSuccess: (data: any) => {
      console.log(`Upload success, response:`, data);
      
      queryClient.invalidateQueries({ queryKey: ["rentals", id] });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      
      toast({
        title: "Success",
        description: "Gallery images uploaded successfully",
      });
      
      // Primary format based on actual API response
      if (data?.data?.additional_images && Array.isArray(data.data.additional_images)) {
        return data.data.additional_images;
      }
      
      // Fallback for other formats
      let imageUrls = null;
      
      if (Array.isArray(data)) {
        imageUrls = data;
      } else if (data?.data?.imageUrls && Array.isArray(data.data.imageUrls)) {
        imageUrls = data.data.imageUrls;
      } else if (data?.imageUrls && Array.isArray(data.imageUrls)) {
        imageUrls = data.imageUrls;
      } else if (data?.additional_images && Array.isArray(data.additional_images)) {
        imageUrls = data.additional_images;
      }
      
      return imageUrls || [];
    },
    onError: (error: any) => {
      console.error(`Upload error:`, error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload gallery images",
        variant: "destructive",
      });
    },
  });
};

// Upload additional images with progress tracking
export const useUploadRentalAdditionalImages = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (files: File[]) => {
      console.log(`Starting additional image upload for rental ID: ${id}`);
      console.log(`Files to upload:`, files);
      
      if (!id) {
        console.error("Missing rental ID for upload");
        throw new Error("Rental ID is required for image upload");
      }
      
      console.log(`Uploading to: /api/v1/rentals/${id}/upload-images`);
      return uploadMultipleFiles(`/api/v1/rentals/${id}/upload-images`, files, "images");
    },
    onSuccess: (data: any) => {
      console.log(`Upload success, response:`, data);
      
      queryClient.invalidateQueries({ queryKey: ["rentals", id] });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      
      toast({
        title: "Success",
        description: "Additional images uploaded successfully",
      });
      
      // Primary format based on actual API response
      if (data?.data?.additional_images && Array.isArray(data.data.additional_images)) {
        return data.data.additional_images;
      }
      
      // Fallback for other formats
      let imageUrls = null;
      
      if (Array.isArray(data)) {
        imageUrls = data;
      } else if (data?.data?.imageUrls && Array.isArray(data.data.imageUrls)) {
        imageUrls = data.data.imageUrls;
      } else if (data?.imageUrls && Array.isArray(data.imageUrls)) {
        imageUrls = data.imageUrls;
      } else if (data?.additional_images && Array.isArray(data.additional_images)) {
        imageUrls = data.additional_images;
      }
      
      return imageUrls || [];
    },
    onError: (error: any) => {
      console.error(`Upload error:`, error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload additional images",
        variant: "destructive",
      });
    },
  });
};
