import { useMutation } from "@tanstack/react-query";
import { fetchApi, uploadFile, uploadMultipleFiles } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

// Upload a single image
export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      console.log('Uploading image:', file.name);
      const response = await uploadFile('/api/v1/images/upload', file, 'image');
      if (!response.data || !response.data.url) {
        throw new Error('Invalid response from server');
      }
      return response.data.url;
    },
    onSuccess: (url) => {
      console.log('Image upload successful:', url);
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
      return url;
    },
    onError: (error) => {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
    },
  });
};

// Upload multiple images
export const useUploadMultipleImages = () => {
  return useMutation({
    mutationFn: async (files: File[]) => {
      console.log('Uploading multiple images:', files.length);
      const response = await uploadMultipleFiles('/api/v1/images/upload-multiple', files);
      if (!response.data || !Array.isArray(response.data.urls)) {
        throw new Error('Invalid response from server');
      }
      // Return the URLs directly as they are already in the correct format
      return response.data.urls;
    },
    onSuccess: (urls) => {
      console.log('Multiple images upload successful:', urls);
      toast({
        title: 'Success',
        description: 'Images uploaded successfully',
      });
      return urls;
    },
    onError: (error) => {
      console.error('Error uploading images:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload images',
        variant: 'destructive',
      });
    },
  });
}; 