import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateSlider, useUpdateSlider } from "@/api/sliders";
import { useUploadImage } from "@/api/images";
import { EnhancedImageUpload } from "@/components/ui/enhanced-image-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface SliderEditorProps {
  sliderType: string;
  onSlideCreated: (data: any) => void;
  currentOrder: number;
  initialData?: any;
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
  status: 'active' | 'inactive';
}

interface FormErrors {
  title?: string;
  image_url?: string;
  cta_link?: string;
}

export function SliderEditor({ sliderType, onSlideCreated, currentOrder, initialData }: SliderEditorProps) {
  const [formData, setFormData] = useState<SliderFormValues>({
    slider_name: sliderType,
    title: initialData?.title || "",
    subtitle: initialData?.subtitle || "",
    content: initialData?.content || "",
    image_url: initialData?.image_url || "",
    cta_text: initialData?.cta_text || "",
    cta_link: initialData?.cta_link || "",
    order: initialData?.order || 0,
    status: initialData?.status || "active",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [imageFile, setImageFile] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const uploadImage = useUploadImage();

  const { toast } = useToast();
  const createSlider = useCreateSlider();
  const updateSlider = useUpdateSlider(initialData?.id || "");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.image_url) {
      newErrors.image_url = "Image is required";
    }

    if (formData.cta_link && !isValidUrl(formData.cta_link)) {
      newErrors.cta_link = "Please enter a valid URL (e.g., https://example.com)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateSlider.mutateAsync(formData);
      } else {
        await createSlider.mutateAsync(formData);
      }
      onSlideCreated(formData);
      toast({
        title: "Success",
        description: initialData ? "Slide updated successfully" : "Slide created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: initialData ? "Failed to update slide" : "Failed to create slide",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
        setErrors(prev => ({ ...prev, image_url: undefined }));
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
    setErrors(prev => ({ ...prev, image_url: "Image is required" }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
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
            onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
            min={0}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting || uploadImage.isPending}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? "Updating..." : "Creating..."}
            </>
          ) : (
            initialData ? "Update Slide" : "Create Slide"
          )}
        </Button>
      </div>
    </form>
  );
} 