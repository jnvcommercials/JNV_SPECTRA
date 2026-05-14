import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useUploadImage } from "./images";

interface StaticContentFormValues {
  id?: string;
  section: string;
  title: string;
  content: string;
  images: string[];
  meta_data?: {
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
  };
}

// Default empty content template
export const getEmptyStaticContent = (contentType: string): StaticContentFormValues => ({
  section: contentType,
  title: '',
  content: '',
  images: [],
  meta_data: {}
});

// Check if content is empty
export const isEmptyContent = (content: StaticContentFormValues): boolean => {
  return !content || 
         (!content.title && 
          !content.content && 
          (!content.images || content.images.length === 0));
};

// Cache configuration
const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
};

// Convert form values to API format
const formatStaticContentData = (values: StaticContentFormValues) => {
  return {
    id: values.id,
    section: values.section,
    title: values.title,
    content: values.content,
    images: values.images,
    meta_data: values.meta_data || {},  // Keep as object, provide empty object as fallback
  };
};

// Fetch static content with empty state handling
export const fetchStaticContent = async (contentType: string) => {
  try {
    const response = await fetchApi(`/api/v1/static-content/${contentType}`);
    if (!response.data) {
      return getEmptyStaticContent(contentType);
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching static content:', error);
    return getEmptyStaticContent(contentType);
  }
};

// Create new static content with optimistic updates
export const useCreateStaticContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: StaticContentFormValues) => {
      const formattedData = formatStaticContentData(data);
      return fetchApi("/api/v1/static-content", {
        method: "POST",
        body: JSON.stringify(formattedData),
      });
    },
    onMutate: async (newContent) => {
      await queryClient.cancelQueries({ queryKey: ["staticContent"] });
      
      const previousContent = queryClient.getQueryData(["staticContent"]);
      
      queryClient.setQueryData(["staticContent"], (old: any) => {
        const newData = {
          ...old,
          data: [...(old?.data || []), { ...newContent, id: "temp" }],
        };
        return newData;
      });
      
      return { previousContent };
    },
    onError: (err, newContent, context) => {
      if (context?.previousContent) {
        queryClient.setQueryData(["staticContent"], context.previousContent);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to create static content",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["staticContent"] });
    },
  });
};

// Update static content with optimistic updates
export const useUpdateStaticContent = (contentType: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: StaticContentFormValues) => {
      const formattedData = formatStaticContentData(data);
      return fetchApi(`/api/v1/static-content/${contentType}`, {
        method: "PUT",
        body: JSON.stringify(formattedData),
      });
    },
    onMutate: async (updatedContent) => {
      await queryClient.cancelQueries({ queryKey: ["staticContent"] });
      await queryClient.cancelQueries({ queryKey: ["staticContent", contentType] });
      
      const previousContent = queryClient.getQueryData(["staticContent"]);
      const previousType = queryClient.getQueryData(["staticContent", contentType]);
      
      queryClient.setQueryData(["staticContent", contentType], updatedContent);
      queryClient.setQueryData(["staticContent"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((content: any) =>
            content.section === contentType ? { ...content, ...updatedContent } : content
          ),
        };
      });
      
      return { previousContent, previousType };
    },
    onError: (err, updatedContent, context) => {
      if (context?.previousContent) {
        queryClient.setQueryData(["staticContent"], context.previousContent);
      }
      if (context?.previousType) {
        queryClient.setQueryData(["staticContent", contentType], context.previousType);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to update static content",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["staticContent"] });
      queryClient.invalidateQueries({ queryKey: ["staticContent", contentType] });
    },
  });
};

// Delete static content with optimistic updates
export const useDeleteStaticContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contentType: string) => {
      return fetchApi(`/api/v1/static-content/${contentType}`, {
        method: "DELETE",
      });
    },
    onMutate: async (contentType) => {
      await queryClient.cancelQueries({ queryKey: ["staticContent"] });
      
      const previousContent = queryClient.getQueryData(["staticContent"]);
      
      queryClient.setQueryData(["staticContent"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((content: any) => content.section !== contentType),
        };
      });
      
      return { previousContent };
    },
    onError: (err, contentType, context) => {
      if (context?.previousContent) {
        queryClient.setQueryData(["staticContent"], context.previousContent);
      }
      toast({
        title: "Error",
        description: err.message || "Failed to delete static content",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["staticContent"] });
    },
  });
};

// Use the generic image upload hook for static content images
export const useUploadStaticContentImage = () => {
  return useUploadImage();
};

// Delete static content image
export const useDeleteStaticContentImage = (contentType: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (imageUrl: string) => {
      return fetchApi(`/api/v1/static-content/${contentType}/image`, {
        method: "DELETE",
        body: JSON.stringify({ imageUrl }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staticContent", contentType] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      });
    },
  });
}; 