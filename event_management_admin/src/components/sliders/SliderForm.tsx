import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateSlider, useUpdateSlider } from "@/api/sliders";
import { useUploadImage } from "@/api/images";
import { EnhancedImageUpload } from "@/components/ui/enhanced-image-upload";
import { Loader2 } from "lucide-react";

interface SliderFormProps {
  initialData?: {
    id?: string;
    slider_name: string;
    title: string;
    subtitle: string;
    content: string;
    image_url: string;
    cta_text: string;
    cta_link: string;
    order: number;
    status: "active" | "inactive";
  };
  onSuccess?: () => void;
}

type SliderFormData = {
  slider_name: string;
  title: string;
  subtitle: string;
  content: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  order: number;
  status: "active" | "inactive";
};

export function SliderForm({ initialData, onSuccess }: SliderFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string[]>([]);
  const uploadImage = useUploadImage();
  
  const [formData, setFormData] = useState<SliderFormData>({
    slider_name: initialData?.slider_name || '',
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    content: initialData?.content || '',
    image_url: initialData?.image_url || '',
    cta_text: initialData?.cta_text || '',
    cta_link: initialData?.cta_link || '',
    order: initialData?.order || 0,
    status: initialData?.status || 'active',
  });

  const createMutation = useCreateSlider();
  const updateMutation = useUpdateSlider(initialData?.id || '');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.slider_name) {
      newErrors.slider_name = 'Slider name is required';
    }
    if (!formData.title) {
      newErrors.title = 'Title is required';
    }
    if (!formData.image_url) {
      newErrors.image_url = 'Image is required';
    }

    // Validate URL format for cta_link if provided
    if (formData.cta_link && !isValidUrl(formData.cta_link)) {
      newErrors.cta_link = 'Please enter a valid URL (e.g., https://example.com)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleImageChange = (files: File[]) => {
    setImageFile(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrl(urls);
  };

  const handleImageUpload = async () => {
    if (imageFile.length === 0) return;
    
    try {
      const response = await uploadImage.mutateAsync(imageFile[0]);
      
      if (response) {
        setFormData(prev => ({ ...prev, image_url: response }));
        setErrors(prev => ({ ...prev, image_url: '' }));
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } else {
        throw new Error("Invalid image URL received from server");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const handleRemoveImage = () => {
    setImageFile([]);
    setPreviewUrl([]);
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (initialData?.id) {
        await updateMutation.mutateAsync(formData);
        toast({
          title: "Success",
          description: "Slide updated successfully",
        });
      } else {
        await createMutation.mutateAsync(formData);
        toast({
          title: "Success",
          description: "Slide created successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["sliders"] });
      onSuccess?.();
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save slide",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slider_name">Slider Name</Label>
              <Input
                id="slider_name"
                value={formData.slider_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, slider_name: e.target.value }))}
                required
              />
              {errors.slider_name && (
                <p className="text-sm text-red-500">{errors.slider_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <EnhancedImageUpload
                label="Slider Image"
                description="This will be displayed as the main image for your slider"
                currentImage={formData.image_url}
                previewUrls={previewUrl}
                onChange={handleImageChange}
                onUpload={handleImageUpload}
                onRemove={handleRemoveImage}
                isUploading={uploadImage.isPending}
                variant="featured"
              />
              {errors.image_url && (
                <p className="text-sm text-red-500">{errors.image_url}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta_text">CTA Text</Label>
              <Input
                id="cta_text"
                value={formData.cta_text}
                onChange={(e) => setFormData((prev) => ({ ...prev, cta_text: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta_link">CTA Link</Label>
              <Input
                id="cta_link"
                value={formData.cta_link}
                onChange={(e) => setFormData((prev) => ({ ...prev, cta_link: e.target.value }))}
                placeholder="https://example.com"
              />
              {errors.cta_link && (
                <p className="text-sm text-red-500">{errors.cta_link}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as "active" | "inactive" }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {initialData?.id ? "Update Slide" : "Create Slide"}
        </Button>
      </div>
    </form>
  );
} 