import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { retry } from "@/lib/utils";
import { useCallback, useRef } from "react";

interface TestimonialFormValues {
  client_name: string;
  location: string;
  rating: number;
  feedback: string;
  featured_image_url: string;
  status: "active" | "inactive";
}

interface TestimonialListParams {
  page?: number;
  limit?: number;
  client_name?: string;
  location?: string;
  rating?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Cache configuration
const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
};

// Fetch testimonials list with enhanced caching
export const useTestimonials = (params: TestimonialListParams = {}) => {
  const queryParams = new URLSearchParams();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.client_name) queryParams.append("client_name", params.client_name);
  if (params.location) queryParams.append("location", params.location);
  if (params.rating) queryParams.append("rating", params.rating.toString());
  if (params.status) queryParams.append("status", params.status);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  
  return useQuery({
    queryKey: ["testimonials", params],
    queryFn: async () => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      try {
        const response = await fetchApi(`/api/v1/testimonials${queryString}`, {
          signal: abortControllerRef.current.signal,
        });
        
        return response;
      } catch (error) {
        if (error.name === "AbortError") {
          // Ignore abort errors
          return;
        }
        throw error;
      }
    },
    retry: (failureCount, error) => retry(failureCount, error),
    staleTime: CACHE_CONFIG.staleTime,
    gcTime: CACHE_CONFIG.cacheTime,
  });
};

// Create a new testimonial with optimistic updates
export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TestimonialFormValues) => {
      return fetchApi("/api/v1/testimonials", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onMutate: async (newTestimonial) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["testimonials"] });
      
      // Snapshot the previous value
      const previousTestimonials = queryClient.getQueryData(["testimonials"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["testimonials"], (old: any) => {
        const newData = {
          ...old,
          data: [...(old?.data || []), { ...newTestimonial, id: "temp" }],
        };
        return newData;
      });
      
      return { previousTestimonials };
    },
    onError: (err, newTestimonial, context) => {
      // Revert to the previous value on error
      if (context?.previousTestimonials) {
        queryClient.setQueryData(["testimonials"], context.previousTestimonials);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to create testimonial",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
};

// Update an existing testimonial with optimistic updates
export const useUpdateTestimonial = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TestimonialFormValues) => {
      return fetchApi(`/api/v1/testimonials/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onMutate: async (updatedTestimonial) => {
      await queryClient.cancelQueries({ queryKey: ["testimonials"] });
      await queryClient.cancelQueries({ queryKey: ["testimonials", id] });
      
      const previousTestimonials = queryClient.getQueryData(["testimonials"]);
      const previousTestimonial = queryClient.getQueryData(["testimonials", id]);
      
      queryClient.setQueryData(["testimonials", id], updatedTestimonial);
      queryClient.setQueryData(["testimonials"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((testimonial: any) =>
            testimonial.id === id ? { ...testimonial, ...updatedTestimonial } : testimonial
          ),
        };
      });
      
      return { previousTestimonials, previousTestimonial };
    },
    onError: (err, updatedTestimonial, context) => {
      if (context?.previousTestimonials) {
        queryClient.setQueryData(["testimonials"], context.previousTestimonials);
      }
      if (context?.previousTestimonial) {
        queryClient.setQueryData(["testimonials", id], context.previousTestimonial);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to update testimonial",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials", id] });
    },
  });
};

// Delete a testimonial with optimistic updates
export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => {
      return fetchApi(`/api/v1/testimonials/${id}`, {
        method: "DELETE",
      });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["testimonials"] });
      
      const previousTestimonials = queryClient.getQueryData(["testimonials"]);
      
      queryClient.setQueryData(["testimonials"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((testimonial: any) => testimonial.id !== id),
        };
      });
      
      return { previousTestimonials };
    },
    onError: (err, id, context) => {
      if (context?.previousTestimonials) {
        queryClient.setQueryData(["testimonials"], context.previousTestimonials);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to delete testimonial",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
}; 