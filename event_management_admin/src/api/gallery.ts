import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";

export interface Gallery {
  id: number;
  title: string;
  tagline: string;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface GalleryResponse {
  status: string;
  data: Gallery;
}

export interface GalleriesResponse {
  status: string;
  data: {
    data: Gallery[];
    count: number;
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const useGalleries = () => {
  return useQuery({
    queryKey: ["galleries"],
    queryFn: async () => {
      const response = await fetchApi("/api/v1/galleries");
      return response.data.data;
    },
  });
};

export const useCreateGallery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (gallery: Omit<Gallery, "id" | "created_at" | "updated_at">) => {
      const response = await fetchApi("/api/v1/galleries", {
        method: "POST",
        body: JSON.stringify(gallery),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
    },
  });
};

export const useUpdateGallery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...gallery }: Partial<Gallery> & { id: number }) => {
      const response = await fetchApi(`/api/v1/galleries/${id}`, {
        method: "PUT",
        body: JSON.stringify(gallery),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
    },
  });
};

export const useDeleteGallery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await fetchApi(`/api/v1/galleries/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
    },
  });
}; 