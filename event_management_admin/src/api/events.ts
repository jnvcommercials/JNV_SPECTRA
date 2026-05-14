import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, uploadFile, uploadMultipleFiles } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { retry } from "@/lib/utils";

// Types and interfaces
export interface Event {
  id: string;
  title: string;
  description: string;
  status: "active" | "inactive";
  featured_image?: string;
  additional_images: string[];
  bullet_points: Array<{ label: string; value: string }>;
  pricing: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  status: "active" | "inactive";
  featured_image?: string;
  additional_images: string[];
  bullet_points: Array<{ label: string; value: string }>;
  pricing: number;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export interface EventsListParams {
  page?: number;
  limit?: number;
  event_type?: string;
  status?: string;
  search?: string; 
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface EventsApiResponse {
  data: Event[];
  count: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

// Configuration constants
const RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  max: 60, // 60 requests per minute
  message: "Too many requests, please try again later",
};

const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
};

// Error handling constants
const ERROR_MESSAGES = {
  NETWORK: "Network error. Please check your connection and try again.",
  SERVER: "Server error. Our team has been notified.",
  UNAUTHORIZED: "Your session has expired. Please log in again.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
  UNKNOWN: "An unexpected error occurred. Please try again.",
  RATE_LIMIT: "Too many requests. Please try again later.",
};

// Format event data for API requests
const formatEventData = (values: CreateEventData): Record<string, any> => {
  const formDataForApi: Record<string, any> = {
    title: values.title,
    description: values.description,
    status: values.status,
    featured_image: values.featured_image,
    additional_images: values.additional_images,
    bullet_points: values.bullet_points,
    pricing: values.pricing
  };

  // Remove undefined values
  return Object.fromEntries(
    Object.entries(formDataForApi).filter(([_, value]) => value !== undefined)
  );
};

// Parse API error response
const parseErrorResponse = (error: any): string => {
  if (!error) return ERROR_MESSAGES.UNKNOWN;
  
  // Network errors
  if (error.message === "Network Error" || !error.response) {
    console.error('[Events API] Network error:', error);
    return ERROR_MESSAGES.NETWORK;
  }
  
  // HTTP status code based errors
  const status = error.response?.status;
  
  if (status === 401) return ERROR_MESSAGES.UNAUTHORIZED;
  if (status === 403) return ERROR_MESSAGES.FORBIDDEN;
  if (status === 404) return ERROR_MESSAGES.NOT_FOUND;
  if (status === 429) return ERROR_MESSAGES.RATE_LIMIT;
  
  // Validation errors
  if (status === 400 && error.response?.data?.message) {
    console.error('[Events API] Validation error:', error.response.data);
    return error.response.data.message;
  }
  
  // Server errors
  if (status >= 500) {
    console.error('[Events API] Server error:', error);
    return ERROR_MESSAGES.SERVER;
  }
  
  // Default fallback
  return error.response?.data?.message || ERROR_MESSAGES.UNKNOWN;
};

// Fetch all events
export function useEvents(params?: EventsListParams) {
  return useQuery<EventsApiResponse>({
    queryKey: ["events", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.event_type) queryParams.append("event_type", params.event_type);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.search) queryParams.append("search", params.search);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await fetchApi(`/api/v1/event-planning${queryString}`);
      return response;
    },
  });
}

// Fetch single event
export function useEvent(id: string) {
  return useQuery<Event>({
    queryKey: ["events", id],
    queryFn: async () => {
      const response = await fetchApi(`/api/v1/event-planning/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

// Create event
export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateEventData) => {
      // Ensure additional_images is an array of strings
      const formattedData = {
        ...data,
        additional_images: Array.isArray(data.additional_images) 
          ? data.additional_images.map(img => typeof img === 'string' ? img : img.url)
          : [],
      };
      
      const response = await fetchApi("/api/v1/event-planning", {
        method: "POST",
        body: JSON.stringify(formattedData),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      });
    },
  });
}

// Update event
export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateEventData) => {
      console.log('[Events API] Starting update mutation with data:', data);
      
      try {
        const formattedData = {
          ...data,
          id,
          additional_images: Array.isArray(data.additional_images) 
            ? data.additional_images
            : [],
          bullet_points: Array.isArray(data.bullet_points)
            ? data.bullet_points
            : [],
          pricing: data.pricing || 0,
          status: data.status || 'active'
        };
        
        console.log('[Events API] Sending update request:', {
          id,
          data: formattedData
        });
        
        const response = await fetchApi(`/api/v1/event-planning/${id}`, {
          method: "PUT",
          body: JSON.stringify(formattedData),
        });
        
        console.log('[Events API] Update response:', response);
        return response.data;
      } catch (error) {
        console.error('[Events API] Update error:', error);
        throw error;
      }
    },
    onMutate: async (updatedEvent) => {
      console.log('[Events API] Starting optimistic update for event:', updatedEvent.id);
      
      try {
        await queryClient.cancelQueries({ queryKey: ["events"] });
        await queryClient.cancelQueries({ queryKey: ["events", updatedEvent.id] });
        
        const previousEvents = queryClient.getQueryData(["events"]);
        const previousEvent = queryClient.getQueryData(["events", updatedEvent.id]);
        
        queryClient.setQueryData(["events", updatedEvent.id], updatedEvent);
        queryClient.setQueryData(["events"], (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((event: any) =>
              event.id === updatedEvent.id ? { ...event, ...updatedEvent } : event
            ),
          };
        });
        
        console.log('[Events API] Optimistic update completed');
        return { previousEvents, previousEvent };
      } catch (error) {
        console.error('[Events API] Optimistic update error:', error);
        throw error;
      }
    },
    onError: (err, updatedEvent, context) => {
      console.error('[Events API] Update mutation error:', {
        error: err,
        eventId: updatedEvent.id,
        context
      });
      
      if (context?.previousEvents) {
        queryClient.setQueryData(["events"], context.previousEvents);
      }
      if (context?.previousEvent) {
        queryClient.setQueryData(["events", updatedEvent.id], context.previousEvent);
      }
      
      const errorMessage = parseErrorResponse(err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
    onSettled: () => {
      console.log('[Events API] Update mutation settled, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// Delete event
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await fetchApi(`/api/v1/event-planning/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      });
    },
  });
}

// Image upload hooks
export function useUploadFeaturedImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await uploadFile("/api/v1/images/upload", file, "image");
      return response.data.url;
    },
  });
}

export function useUploadGalleryImages() {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const response = await uploadMultipleFiles("/api/v1/images/upload-multiple", files, "files");
      return response.data.urls;
    },
  });
} 