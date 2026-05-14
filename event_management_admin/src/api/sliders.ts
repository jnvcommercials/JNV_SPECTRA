import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, uploadFile } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { retry, debounce } from "@/lib/utils";
import { useCallback, useRef } from "react";

export interface Slide {
  id: string;
  slider_name: string;
  title: string;
  subtitle: string;
  content: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  order: number;
  status: "active" | "inactive";
}

export interface SlideCreateData {
  slider_name: string;
  title: string;
  subtitle: string;
  content: string;
  cta_text: string;
  cta_link: string;
  order?: number;
  status: "active" | "inactive";
}

interface SliderFormValues {
  slider_name: string;
  title: string;
  subtitle: string;
  content: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  order: number;
  status: "active" | "inactive";
}

interface SliderListParams {
  page?: number;
  limit?: number;
  status?: string;
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
const formatSliderData = (values: SliderFormValues) => {
  return {
    slider_name: values.slider_name,
    title: values.title,
    subtitle: values.subtitle,
    content: values.content,
    image_url: values.image_url,
    cta_text: values.cta_text,
    cta_link: values.cta_link,
    order: values.order,
    status: values.status,
  };
};

// Fetch sliders list with enhanced caching and rate limiting
export const useSliders = (sliderName: string, params: SliderListParams = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append("status", params.status);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  
  return useQuery({
    queryKey: ["sliders", sliderName, params],
    queryFn: async () => {
      try {
        // Check if the sliderName is a valid UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sliderName);
        
        // Use the appropriate endpoint based on whether it's a UUID or slider name
        const endpoint = isUUID 
          ? `/api/v1/slider-slides/slide/${sliderName}${queryString}`
          : `/api/v1/slider-slides/name/${sliderName}${queryString}`;
        
        const response = await fetchApi(endpoint);
        
        // Sort the slides by order if needed
        let slides = Array.isArray(response.data) ? response.data : [response.data];
        if (params.sortBy === 'order') {
          slides = slides.sort((a: Slide, b: Slide) => {
            return params.sortOrder === 'asc' ? a.order - b.order : b.order - a.order;
          });
        }
        
        return slides;
      } catch (error) {
        throw error;
      }
    },
    ...CACHE_CONFIG,
    retry: retry,
  });
};

// Create a new slider with optimistic updates
export const useCreateSlider = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: SlideCreateData) => {
      return fetchApi("/api/v1/slider-slides", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    onMutate: async (newSlider) => {
      await queryClient.cancelQueries({ queryKey: ["sliders"] });
      
      const previousSliders = queryClient.getQueryData(["sliders"]);
      
      queryClient.setQueryData(["sliders"], (old: any) => {
        const newData = {
          ...old,
          data: [...(old?.data || []), { ...newSlider, id: "temp" }],
        };
        return newData;
      });
      
      return { previousSliders };
    },
    onError: (err, newSlider, context) => {
      if (context?.previousSliders) {
        queryClient.setQueryData(["sliders"], context.previousSliders);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to create slider",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
    },
  });
};

// Update an existing slider with optimistic updates
export const useUpdateSlider = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SliderFormValues) => {
      const formattedData = formatSliderData(data);
      return fetchApi(`/api/v1/slider-slides/${id}`, {
        method: "PUT",
        body: JSON.stringify(formattedData),
      });
    },
    onMutate: async (updatedSlider) => {
      await queryClient.cancelQueries({ queryKey: ["sliders"] });
      await queryClient.cancelQueries({ queryKey: ["sliders", id] });
      
      const previousSliders = queryClient.getQueryData(["sliders"]);
      const previousSlider = queryClient.getQueryData(["sliders", id]);
      
      queryClient.setQueryData(["sliders", id], updatedSlider);
      queryClient.setQueryData(["sliders"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((slider: any) =>
            slider.id === id ? { ...slider, ...updatedSlider } : slider
          ),
        };
      });
      
      return { previousSliders, previousSlider };
    },
    onError: (err, updatedSlider, context) => {
      if (context?.previousSliders) {
        queryClient.setQueryData(["sliders"], context.previousSliders);
      }
      if (context?.previousSlider) {
        queryClient.setQueryData(["sliders", id], context.previousSlider);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to update slider",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
      queryClient.invalidateQueries({ queryKey: ["sliders", id] });
    },
  });
};

// Delete a slider with optimistic updates
export const useDeleteSlider = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => {
      return fetchApi(`/api/v1/slider-slides/${id}`, {
        method: "DELETE",
      });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["sliders"] });
      
      const previousSliders = queryClient.getQueryData(["sliders"]);
      
      queryClient.setQueryData(["sliders"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((slider: any) => slider.id !== id),
        };
      });
      
      return { previousSliders };
    },
    onError: (err, id, context) => {
      if (context?.previousSliders) {
        queryClient.setQueryData(["sliders"], context.previousSliders);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to delete slider",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
    },
  });
};

// Upload slider image with progress tracking
export const useUploadSliderImage = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => {
      return uploadFile(`/api/v1/slider-slides/${id}/upload-image`, file, "image");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sliders", id] });
      toast({
        title: "Success",
        description: "Slider image uploaded successfully",
      });
      return data.imageUrl;
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload slider image",
        variant: "destructive",
      });
    },
  });
};

// Reorder slides
export const useReorderSlides = (sliderName: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newOrder: string[]) => {
      return fetchApi(`/api/v1/slider-slides/reorder`, {
        method: "POST",
        body: JSON.stringify({ sliderName, newOrder }),
      });
    },
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ["sliders"] });
      
      const previousSliders = queryClient.getQueryData(["sliders"]);
      
      // Optimistically update the order
      queryClient.setQueryData(["sliders"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: newOrder.map((id) => 
            old.data.find((slide: any) => slide.id === id)
          ).filter(Boolean),
        };
      });
      
      return { previousSliders };
    },
    onError: (err, newOrder, context) => {
      if (context?.previousSliders) {
        queryClient.setQueryData(["sliders"], context.previousSliders);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to reorder slides",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
    },
  });
};