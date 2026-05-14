import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, uploadFile, uploadMultipleFiles } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { retry, debounce } from "@/lib/utils";
import { useCallback, useRef } from "react";
import { Venue } from "@/pages/Venues";

interface VenueFormValues {
  title: string;
  description: string;
  location: string;
  capacity: "less than 50" | "10-50" | "50-150" | "150+";
  venue_type: "banquet halls" | "Garden and Outdoor venues" | "Resorts" | "Roof top" | "Beach front venues";
  space_preference: "indoor" | "outdoor" | "both";
  rating: number;
  featured_image?: string;
  additional_images?: string[];
  bullet_points?: Array<{
    label: string;
    value: string;
  }>;
  status: "active" | "draft" | "archived";
}

interface VenueListParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
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
const formatVenueData = (values: VenueFormValues) => {
  return {
    title: values.title,
    description: values.description,
    location: values.location,
    capacity: values.capacity,
    venue_type: values.venue_type,
    space_preference: values.space_preference,
    rating: values.rating,
    featured_image: values.featured_image,
    additional_images: values.additional_images || [],
    bullet_points: values.bullet_points || [],
    status: values.status,
  };
};

// Fetch venues list with enhanced caching and rate limiting
export const useVenues = (params: VenueListParams = {}) => {
  const queryParams = new URLSearchParams();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.category) queryParams.append("category", params.category);
  if (params.status) queryParams.append("status", params.status);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.search) queryParams.append("search", params.search);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  console.log(`[useVenues] Making request to: /api/v1/venues${queryString}`);
  
  return useQuery({
    queryKey: ["venues", params],
    queryFn: async () => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      try {
        console.log(`[useVenues] Fetching data from: /api/v1/venues${queryString}`);
        const response = await fetchApi(`/api/v1/venues${queryString}`, {
          signal: abortControllerRef.current.signal,
        });
        
        // If response is error or not valid, throw immediately
        if (!response || response.error) {
          const error = response?.error || "Invalid response from server";
          console.error(`[useVenues] API error:`, error);
          throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
        }
        
        console.log(`[useVenues] API response:`, response);
        
        return response;
      } catch (error) {
        console.error(`[useVenues] Error fetching venues:`, error);
        throw error; // Ensure the error is propagated
      }
    },
    retry: 1, // Only retry once
    staleTime: CACHE_CONFIG.staleTime,
    gcTime: CACHE_CONFIG.gcTime,
  });
};

// Create a new venue with optimistic updates
export const useCreateVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: VenueFormValues) => {
      const formattedData = formatVenueData(data);
      return fetchApi("/api/v1/venues", {
        method: "POST",
        body: JSON.stringify(formattedData),
      });
    },
    onMutate: async (newVenue) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["venues"] });
      
      // Snapshot the previous value
      const previousVenues = queryClient.getQueryData(["venues"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["venues"], (old: any) => {
        const newData = {
          ...old,
          data: [...(old?.data || []), { ...newVenue, id: "temp" }],
        };
        return newData;
      });
      
      return { previousVenues };
    },
    onError: (err, newVenue, context) => {
      // Revert to the previous value on error
      if (context?.previousVenues) {
        queryClient.setQueryData(["venues"], context.previousVenues);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to create venue",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["venues"] });
    },
  });
};

// Update an existing venue with optimistic updates
export const useUpdateVenue = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: VenueFormValues) => {
      const formattedData = formatVenueData(data);
      return fetchApi(`/api/v1/venues/${id}`, {
        method: "PUT",
        body: JSON.stringify(formattedData),
      });
    },
    onMutate: async (updatedVenue) => {
      await queryClient.cancelQueries({ queryKey: ["venues"] });
      await queryClient.cancelQueries({ queryKey: ["venues", id] });
      
      const previousVenues = queryClient.getQueryData(["venues"]);
      const previousVenue = queryClient.getQueryData(["venues", id]);
      
      queryClient.setQueryData(["venues", id], updatedVenue);
      queryClient.setQueryData(["venues"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((venue: any) =>
            venue.id === id ? { ...venue, ...updatedVenue } : venue
          ),
        };
      });
      
      return { previousVenues, previousVenue };
    },
    onError: (err, updatedVenue, context) => {
      if (context?.previousVenues) {
        queryClient.setQueryData(["venues"], context.previousVenues);
      }
      if (context?.previousVenue) {
        queryClient.setQueryData(["venues", id], context.previousVenue);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to update venue",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["venues", id] });
    },
  });
};

// Delete a venue with optimistic updates
export const useDeleteVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => {
      return fetchApi(`/api/v1/venues/${id}`, {
        method: "DELETE",
      });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["venues"] });
      
      const previousVenues = queryClient.getQueryData(["venues"]);
      
      queryClient.setQueryData(["venues"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((venue: any) => venue.id !== id),
        };
      });
      
      return { previousVenues };
    },
    onError: (err, id, context) => {
      if (context?.previousVenues) {
        queryClient.setQueryData(["venues"], context.previousVenues);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to delete venue",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
    },
  });
};

// Upload featured image for a venue
export const useUploadVenueFeaturedImage = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => {
      console.log(`Starting upload for venue ID: ${id}`);
      console.log(`File to upload:`, file);
      
      if (!id) {
        console.error("Missing venue ID for upload");
        throw new Error("Venue ID is required for image upload");
      }
      
      console.log(`Uploading to: /api/v1/images/upload`);
      return uploadFile(`/api/v1/images/upload`, file, "image");
    },
    onSuccess: (data: any) => {
      console.log(`Upload success, response:`, data);
      
      // Get the image URL from the generic upload response
      const imageUrl = data?.data?.url;
      
      if (!imageUrl) {
        throw new Error("No image URL received from server");
      }
      
      toast({
        title: "Success",
        description: "Featured image uploaded successfully",
      });
      
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

// Upload additional images for a venue
export const useUploadVenueAdditionalImages = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (files: File[]) => {
      console.log(`Starting gallery upload for venue ID: ${id}`);
      console.log(`Files to upload:`, files);
      
      if (!id) {
        console.error("Missing venue ID for upload");
        throw new Error("Venue ID is required for image upload");
      }
      
      console.log(`Uploading to: /api/v1/images/upload-multiple`);
      return uploadMultipleFiles(`/api/v1/images/upload-multiple`, files, "files");
    },
    onSuccess: (data: any) => {
      console.log(`Upload success, response:`, data);
      
      // Get the image URLs from the response - using 'urls' instead of 'files'
      const imageUrls = data?.data?.urls || [];
      
      if (imageUrls.length === 0) {
        throw new Error("No image URLs received from server");
      }
      
      toast({
        title: "Success",
        description: "Gallery images uploaded successfully",
      });
      
      return imageUrls;
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