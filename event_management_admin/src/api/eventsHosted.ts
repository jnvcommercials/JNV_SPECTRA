import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, uploadFile, uploadMultipleFiles } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { retry, debounce } from "@/lib/utils";
import { useCallback, useRef } from "react";

interface EventHostedFormValues {
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location: string;
  capacity: number;
  price: number;
  featured_image?: string;
  gallery_images?: string[];
  status: "active" | "inactive";
  bullet_points?: Array<{
    title: string;
    description: string;
  }>;
  highlights?: string[];
  requirements?: string[];
  included_items?: string[];
  add_ons?: string[];
}

interface EventHostedListParams {
  page?: number;
  limit?: number;
  event_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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
  cacheTime: 30 * 60 * 1000, // 30 minutes
};

// Convert form values to API format
const formatEventHostedData = (values: EventHostedFormValues) => {
  return {
    title: values.title,
    description: values.description,
    event_type: values.event_type,
    start_date: values.start_date,
    end_date: values.end_date,
    location: values.location,
    capacity: values.capacity,
    price: values.price,
    featured_image: values.featured_image,
    gallery_images: values.gallery_images || [],
    status: values.status,
    bullet_points: values.bullet_points || [],
    highlights: values.highlights || [],
    requirements: values.requirements || [],
    included_items: values.included_items || [],
    add_ons: values.add_ons || [],
  };
};

// Fetch events hosted list with enhanced caching and rate limiting
export const useEventsHosted = (params: EventHostedListParams = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.event_type) queryParams.append("event_type", params.event_type);
  if (params.status) queryParams.append("status", params.status);
  if (params.start_date) queryParams.append("start_date", params.start_date);
  if (params.end_date) queryParams.append("end_date", params.end_date);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  
  return useQuery({
    queryKey: ["events-hosted", params],
    queryFn: async () => {
      try {
        const response = await fetchApi(`/api/v1/events-hosted${queryString}`);
        
        // Check rate limit headers
        const remaining = response.headers.get("X-RateLimit-Remaining");
        if (remaining && parseInt(remaining) < 10) {
          toast({
            title: "Rate Limit Warning",
            description: `You have ${remaining} requests remaining this minute`,
            variant: "warning",
          });
        }
        
        return response;
      } catch (error) {
        throw error;
      }
    },
    retry: (failureCount, error) => retry(failureCount, error),
    staleTime: CACHE_CONFIG.staleTime,
    cacheTime: CACHE_CONFIG.cacheTime,
  });
};

// Create a new event hosted with optimistic updates
export const useCreateEventHosted = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: EventHostedFormValues) => {
      const formattedData = formatEventHostedData(data);
      return fetchApi("/api/v1/events-hosted", {
        method: "POST",
        body: JSON.stringify(formattedData),
      });
    },
    onMutate: async (newEvent) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["events-hosted"] });
      
      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData(["events-hosted"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["events-hosted"], (old: any) => {
        const newData = {
          ...old,
          data: [...(old?.data || []), { ...newEvent, id: "temp" }],
        };
        return newData;
      });
      
      return { previousEvents };
    },
    onError: (err, newEvent, context) => {
      // Revert to the previous value on error
      if (context?.previousEvents) {
        queryClient.setQueryData(["events-hosted"], context.previousEvents);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to create event",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["events-hosted"] });
    },
  });
};

// Update an existing event hosted with optimistic updates
export const useUpdateEventHosted = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: EventHostedFormValues) => {
      const formattedData = formatEventHostedData(data);
      return fetchApi(`/api/v1/events-hosted/${id}`, {
        method: "PUT",
        body: JSON.stringify(formattedData),
      });
    },
    onMutate: async (updatedEvent) => {
      await queryClient.cancelQueries({ queryKey: ["events-hosted"] });
      await queryClient.cancelQueries({ queryKey: ["events-hosted", id] });
      
      const previousEvents = queryClient.getQueryData(["events-hosted"]);
      const previousEvent = queryClient.getQueryData(["events-hosted", id]);
      
      queryClient.setQueryData(["events-hosted", id], updatedEvent);
      queryClient.setQueryData(["events-hosted"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((event: any) =>
            event.id === id ? { ...event, ...updatedEvent } : event
          ),
        };
      });
      
      return { previousEvents, previousEvent };
    },
    onError: (err, updatedEvent, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(["events-hosted"], context.previousEvents);
      }
      if (context?.previousEvent) {
        queryClient.setQueryData(["events-hosted", id], context.previousEvent);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to update event",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["events-hosted"] });
      queryClient.invalidateQueries({ queryKey: ["events-hosted", id] });
    },
  });
};

// Delete an event hosted with optimistic updates
export const useDeleteEventHosted = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => {
      return fetchApi(`/api/v1/events-hosted/${id}`, {
        method: "DELETE",
      });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["events-hosted"] });
      
      const previousEvents = queryClient.getQueryData(["events-hosted"]);
      
      queryClient.setQueryData(["events-hosted"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((event: any) => event.id !== id),
        };
      });
      
      return { previousEvents };
    },
    onError: (err, id, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(["events-hosted"], context.previousEvents);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to delete event",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["events-hosted"] });
    },
  });
};

// Upload featured image with progress tracking
export const useUploadEventHostedFeaturedImage = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => {
      return uploadFile(`/api/v1/events-hosted/${id}/upload-image`, file, "featured_image", {
        onProgress: (progress) => {
          // Update progress in the UI
          toast({
            title: "Upload Progress",
            description: `Uploading featured image: ${Math.round(progress * 100)}%`,
            variant: "default",
          });
        },
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events-hosted", id] });
      toast({
        title: "Success",
        description: "Featured image uploaded successfully",
      });
      return data.imageUrl;
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload featured image",
        variant: "destructive",
      });
    },
  });
};

// Upload gallery images with progress tracking
export const useUploadEventHostedGalleryImages = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (files: File[]) => {
      return uploadMultipleFiles(`/api/v1/events-hosted/${id}/upload-images`, files, "gallery_images", {
        onProgress: (progress) => {
          toast({
            title: "Upload Progress",
            description: `Uploading gallery images: ${Math.round(progress * 100)}%`,
            variant: "default",
          });
        },
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events-hosted", id] });
      toast({
        title: "Success",
        description: "Gallery images uploaded successfully",
      });
      return data.imageUrls;
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload gallery images",
        variant: "destructive",
      });
    },
  });
}; 