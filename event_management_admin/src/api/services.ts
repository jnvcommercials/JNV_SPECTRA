import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { retry, debounce } from "@/lib/utils";
import { useCallback, useRef } from "react";
import { useUploadImage, useUploadMultipleImages } from "./images";

export interface Service {
  id: string;
  title: string;
  description: string;
  featured_image?: string;
  additional_images?: string[];
  bullet_points?: Array<{
    title: string;
    description: string;
  }>;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}

export interface ServiceFormValues {
  title: string;
  description: string;
  featured_image?: string;
  additional_images?: string[];
  bullet_points?: Array<{
    title: string;
    description: string;
  }>;
  status: "active" | "inactive";
}

export interface ServiceListParams {
  page?: number;
  limit?: number;
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
const formatServiceData = (values: ServiceFormValues) => {
  return {
    title: values.title,
    description: values.description,
    featured_image: values.featured_image,
    additional_images: values.additional_images || [],
    bullet_points: values.bullet_points || [],
    status: values.status,
  };
};

// Fetch services list with enhanced caching and rate limiting
export const useServices = (params: ServiceListParams = {}) => {
  const queryParams = new URLSearchParams();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.status) queryParams.append("status", params.status);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.search) queryParams.append("search", params.search);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  console.log(`[useServices] Making request to: /api/v1/services${queryString}`);
  
  return useQuery({
    queryKey: ["services", params],
    queryFn: async () => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      try {
        console.log(`[useServices] Fetching data from: /api/v1/services${queryString}`);
        const response = await fetchApi(`/api/v1/services${queryString}`, {
          signal: abortControllerRef.current.signal,
        });
        
        // If response is error or not valid, throw immediately
        if (!response || response.error) {
          const error = response?.error || "Invalid response from server";
          console.error(`[useServices] API error:`, error);
          throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
        }
        
        console.log(`[useServices] API response:`, response);
        
        return response;
      } catch (error) {
        console.error(`[useServices] Error fetching services:`, error);
        throw error; // Ensure the error is propagated
      }
    },
    retry: 1, // Only retry once
    staleTime: CACHE_CONFIG.staleTime,
    gcTime: CACHE_CONFIG.gcTime,
  });
};

// Create a new service with optimistic updates
export const useCreateService = () => {
  const queryClient = useQueryClient();
  const uploadImage = useUploadImage();
  const uploadMultipleImages = useUploadMultipleImages();
  
  return useMutation({
    mutationFn: async (data: ServiceFormValues) => {
      // First upload featured image if present
      let featuredImageUrl = data.featured_image;
      if (data.featured_image && typeof data.featured_image === 'object') {
        featuredImageUrl = await uploadImage.mutateAsync(data.featured_image as File);
      }

      // Then upload additional images if present
      let additionalImageUrls = data.additional_images || [];
      const fileImages = data.additional_images?.filter(img => img && typeof img === 'object') as File[];
      if (fileImages && fileImages.length > 0) {
        const urls = await uploadMultipleImages.mutateAsync(fileImages);
        additionalImageUrls = [
          ...(data.additional_images?.filter(img => typeof img === 'string') || []),
          ...urls
        ];
      }

      const formattedData = formatServiceData({
        ...data,
        featured_image: featuredImageUrl,
        additional_images: additionalImageUrls
      });

      return fetchApi("/api/v1/services", {
        method: "POST",
        body: JSON.stringify(formattedData),
      });
    },
    onMutate: async (newService) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["services"] });
      
      // Snapshot the previous value
      const previousServices = queryClient.getQueryData(["services"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["services"], (old: any) => {
        const newData = {
          ...old,
          data: [...(old?.data || []), { ...newService, id: "temp" }],
        };
        return newData;
      });
      
      return { previousServices };
    },
    onError: (err, newService, context) => {
      // Revert to the previous value on error
      if (context?.previousServices) {
        queryClient.setQueryData(["services"], context.previousServices);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to create service",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

// Update an existing service with optimistic updates
export const useUpdateService = (id: string) => {
  const queryClient = useQueryClient();
  const uploadImage = useUploadImage();
  const uploadMultipleImages = useUploadMultipleImages();
  
  return useMutation({
    mutationFn: async (data: ServiceFormValues) => {
      // First upload featured image if present
      let featuredImageUrl = data.featured_image;
      if (data.featured_image && typeof data.featured_image === 'object') {
        featuredImageUrl = await uploadImage.mutateAsync(data.featured_image as File);
      }

      // Then upload additional images if present
      let additionalImageUrls = data.additional_images || [];
      const fileImages = data.additional_images?.filter(img => img && typeof img === 'object') as File[];
      if (fileImages && fileImages.length > 0) {
        const urls = await uploadMultipleImages.mutateAsync(fileImages);
        additionalImageUrls = [
          ...(data.additional_images?.filter(img => typeof img === 'string') || []),
          ...urls
        ];
      }

      const formattedData = formatServiceData({
        ...data,
        featured_image: featuredImageUrl,
        additional_images: additionalImageUrls
      });

      return fetchApi(`/api/v1/services/${id}`, {
        method: "PUT",
        body: JSON.stringify(formattedData),
      });
    },
    onMutate: async (updatedService) => {
      await queryClient.cancelQueries({ queryKey: ["services"] });
      await queryClient.cancelQueries({ queryKey: ["services", id] });
      
      const previousServices = queryClient.getQueryData(["services"]);
      const previousService = queryClient.getQueryData(["services", id]);
      
      queryClient.setQueryData(["services", id], updatedService);
      queryClient.setQueryData(["services"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((service: any) =>
            service.id === id ? { ...service, ...updatedService } : service
          ),
        };
      });
      
      return { previousServices, previousService };
    },
    onError: (err, updatedService, context) => {
      if (context?.previousServices) {
        queryClient.setQueryData(["services"], context.previousServices);
      }
      if (context?.previousService) {
        queryClient.setQueryData(["services", id], context.previousService);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to update service",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services", id] });
    },
  });
};

// Delete a service with optimistic updates
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => {
      return fetchApi(`/api/v1/services/${id}`, {
        method: "DELETE",
      });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["services"] });
      
      const previousServices = queryClient.getQueryData(["services"]);
      
      queryClient.setQueryData(["services"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((service: any) => service.id !== id),
        };
      });
      
      return { previousServices };
    },
    onError: (err, id, context) => {
      if (context?.previousServices) {
        queryClient.setQueryData(["services"], context.previousServices);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to delete service",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

// Get featured services
export const useFeaturedServices = (limit: number = 3) => {
  return useQuery({
    queryKey: ["services", "featured", limit],
    queryFn: async () => {
      const response = await fetchApi(`/api/v1/services/featured?limit=${limit}`);
      return response;
    },
    staleTime: CACHE_CONFIG.staleTime,
    gcTime: CACHE_CONFIG.gcTime,
  });
};
