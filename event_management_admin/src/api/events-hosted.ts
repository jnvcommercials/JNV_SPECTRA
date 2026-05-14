import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, uploadFile, uploadMultipleFiles } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

// Type definitions
export interface EventHosted {
  id?: string;
  event_title: string;
  event_date: string;
  event_type: string;
  short_description: string;
  detailed_description: string;
  featured_image?: string;
  gallery_images?: Array<{
    url: string;
    tag: string;
  }>;
  status: "active" | "archived";
  location?: string;
  time?: string;
  feedback?: string;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EventHostedFormData {
  title: string;
  description: string;
  event_type: string;
  date: Date;
  time?: string;
  location: string;
  status: "completed" | "cancelled";
  feedback: string;
  rating: number;
  gallery_images?: string[];
  featured_image?: string;
}

export interface EventHostedFilters {
  page?: number;
  limit?: number;
  event_type?: string;
  status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
  start_date?: string;
  end_date?: string;
}

// API hooks
export const useEventsHosted = (filters: EventHostedFilters = {}) => {
  const queryParams = new URLSearchParams();

  if (filters.page) queryParams.append("page", filters.page.toString());
  if (filters.limit) queryParams.append("limit", filters.limit.toString());
  if (filters.event_type) queryParams.append("event_type", filters.event_type);
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.sort_by) queryParams.append("sort_by", filters.sort_by);
  if (filters.sort_order) queryParams.append("sort_order", filters.sort_order);
  if (filters.search) queryParams.append("search", filters.search);
  if (filters.start_date) queryParams.append("start_date", filters.start_date);
  if (filters.end_date) queryParams.append("end_date", filters.end_date);

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return useQuery({
    queryKey: ["events-hosted", filters],
    queryFn: () => fetchApi(`/api/v1/events-hosted${queryString}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEventHosted = (id: string) => {
  return useQuery({
    queryKey: ["events-hosted", id],
    queryFn: () => fetchApi(`/api/v1/events-hosted/${id}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
  });
};

export const useCreateEventHosted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: EventHostedFormData) => {
      // Convert form data to API format
      const eventData: EventHosted = {
        event_title: formData.title,
        event_date: formData.date.toISOString().split('T')[0],
        event_type: formData.event_type,
        short_description: formData.description,
        detailed_description: formData.description,
        status: formData.status === "completed" ? "active" : "archived",
        location: formData.location,
        time: formData.time,
        feedback: formData.feedback,
        rating: formData.rating
      };

      return fetchApi("/api/v1/events-hosted", {
        method: "POST",
        body: JSON.stringify(eventData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events-hosted"] });
      toast({
        title: "Success",
        description: "Event hosted record created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event hosted record",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateEventHosted = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: EventHostedFormData) => {
      // Convert form data to API format
      const eventData: Partial<EventHosted> = {
        event_title: formData.title,
        event_date: formData.date.toISOString().split('T')[0],
        event_type: formData.event_type,
        short_description: formData.description,
        detailed_description: formData.description,
        status: formData.status === "completed" ? "active" : "archived",
        location: formData.location,
        time: formData.time,
        feedback: formData.feedback,
        rating: formData.rating,
        featured_image: formData.featured_image,
        gallery_images: formData.gallery_images?.map(url => ({ url, tag: '' }))
      };

      return fetchApi(`/api/v1/events-hosted/${id}`, {
        method: "PUT",
        body: JSON.stringify(eventData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events-hosted"] });
      toast({
        title: "Success",
        description: "Event hosted record updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event hosted record",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteEventHosted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return fetchApi(`/api/v1/events-hosted/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events-hosted"] });
      toast({
        title: "Success",
        description: "Event hosted record deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event hosted record",
        variant: "destructive",
      });
    },
  });
};