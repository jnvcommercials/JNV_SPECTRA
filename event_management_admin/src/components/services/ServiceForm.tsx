import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, AlertCircle, Plus, Trash2 } from "lucide-react";
import { ServiceFormValues } from "@/api/services";
import { useUploadImage, useUploadMultipleImages } from "@/api/images";
import { useToast } from "@/hooks/use-toast";
import { EnhancedImageUpload } from "@/components/ui/enhanced-image-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";

const serviceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  featured_image: z.string().optional(),
  additional_images: z.array(z.string()).optional(),
  bullet_points: z.array(z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required")
  })).default([]),
  status: z.enum(["active", "inactive"]).default("active")
});

// Extended interface for the initialData prop to include the id field
interface ServiceFormData extends ServiceFormValues {
  id?: string;
}

interface ServiceFormProps {
  initialData?: Partial<ServiceFormData>;
  onSubmit: (values: ServiceFormValues) => void;
  isLoading?: boolean;
}

export function ServiceForm({ initialData, onSubmit, isLoading }: ServiceFormProps) {
  const { toast } = useToast();
  
  // For featured image
  const [featuredImageFile, setFeaturedImageFile] = useState<File[]>([]);
  const [featuredPreview, setFeaturedPreview] = useState<string[]>([]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(
    initialData?.featured_image || null
  );
  
  // For gallery images
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    Array.isArray(initialData?.additional_images) ? initialData.additional_images : []
  );

  const serviceId = initialData?.id || "";
  const hasServiceId = !!serviceId;
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const uploadImage = useUploadImage();
  const uploadMultipleImages = useUploadMultipleImages();

  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      featured_image: initialData?.featured_image || "",
      additional_images: Array.isArray(initialData?.additional_images) ? initialData.additional_images : [],
      bullet_points: Array.isArray(initialData?.bullet_points) ? initialData.bullet_points : [],
      status: initialData?.status || "active"
    },
    mode: "onSubmit"
  });

  // Set up field array for bullet points
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bullet_points",
  });

  // Add form state logging
  console.log('Form state:', {
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
    isValid: form.formState.isValid,
    errors: form.formState.errors
  });

  // Log validation errors when they occur
  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.error('Form validation errors:', form.formState.errors);
    }
  }, [form.formState.errors]);

  // Handle featured image selection
  const handleFeaturedImageChange = (files: File[]) => {
    if (files.length > 0) {
      setFeaturedImageFile(files);
      const urls = files.map(file => URL.createObjectURL(file));
      setFeaturedPreview(urls);
    }
  };
  
  // Handle gallery images selection
  const handleGalleryImagesChange = (files: File[]) => {
    if (files.length > 0) {
      setGalleryFiles(prev => [...prev, ...files]);
      const urls = files.map(file => URL.createObjectURL(file));
      setGalleryPreviews(prev => [...prev, ...urls]);
    }
  };
  
  // Handle featured image removal
  const handleRemoveFeatured = () => {
    setFeaturedImageFile([]);
    setFeaturedPreview([]);
    if (featuredImageUrl) {
      // In a real app, you might want to send a request to delete the image on the server
      setFeaturedImageUrl(null);
      form.setValue("featured_image", "");
    }
  };
  
  // Handle gallery image removal
  const handleRemoveGallery = (index: number) => {
    // Remove from files and previews
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    
    // Remove from URLs if it exists
    if (galleryUrls[index]) {
      const newUrls = galleryUrls.filter((_, i) => i !== index);
      setGalleryUrls(newUrls);
      form.setValue("additional_images", newUrls);
    }
  };

  const handleFeaturedImageUpload = async () => {
    if (featuredImageFile.length === 0) return;
    
    try {
      setIsLoadingFeatured(true);
      
      const response = await uploadImage.mutateAsync(featuredImageFile[0]);
      
      if (response) {
        setFeaturedImageUrl(response);
        form.setValue("featured_image", response);
        toast({
          title: "Success",
          description: "Featured image uploaded successfully",
        });
      } else {
        throw new Error("Invalid image URL received from server");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload featured image",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFeatured(false);
    }
  };

  const handleGalleryImagesUpload = async () => {
    if (galleryFiles.length === 0) return;
    
    try {
      setIsLoadingGallery(true);
      
      const response = await uploadMultipleImages.mutateAsync(galleryFiles);
      
      if (response && Array.isArray(response)) {
        // Combine existing URLs with new ones
        const newUrls = [...galleryUrls, ...response];
        setGalleryUrls(newUrls);
        form.setValue("additional_images", newUrls);
        
        // Clear only the files and previews that were just uploaded
        setGalleryFiles([]);
        setGalleryPreviews([]);
        
        toast({
          title: "Success",
          description: "Gallery images uploaded successfully",
        });
      } else {
        throw new Error("Invalid image URLs received from server");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload gallery images",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const handleSubmit = async (values: ServiceFormValues) => {
    try {
      console.log('Form submission started');
      console.log('Form values before submission:', values);
      console.log('Form state during submission:', {
        isDirty: form.formState.isDirty,
        isSubmitting: form.formState.isSubmitting,
        isValid: form.formState.isValid,
        errors: form.formState.errors
      });
      console.log('Featured image URL:', featuredImageUrl);
      console.log('Gallery URLs:', galleryUrls);
      
      // Check if required fields are present
      if (!values.title || !values.description) {
        console.error('Missing required fields:', { title: values.title, description: values.description });
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const submissionData = {
        ...values,
        featured_image: featuredImageUrl || values.featured_image,
        additional_images: galleryUrls.length > 0 ? galleryUrls : values.additional_images,
      };

      console.log('Final submission data:', submissionData);

      await onSubmit(submissionData);
      console.log('Form submission completed successfully');
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-medium">Service Details</h2>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form 
            onSubmit={(e) => {
              console.log('Form submit event triggered');
              form.handleSubmit(handleSubmit)(e);
            }} 
            className="space-y-6"
          >
            {/* Basic form fields */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter service title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter service description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Bullet Points Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Bullet Points</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ title: "", description: "" })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bullet Point
                </Button>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-4">
                      <FormField
                        control={form.control}
                        name={`bullet_points.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter bullet point title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`bullet_points.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter bullet point description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Image upload section - stacked vertically */}
            <div className="space-y-6">
              {/* Featured Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Featured Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedImageUpload
                    label="Featured Service Image"
                    description="This will be displayed as the main image for your service"
                    currentImage={featuredImageUrl}
                    previewUrls={featuredPreview}
                    onChange={handleFeaturedImageChange}
                    onUpload={handleFeaturedImageUpload}
                    onRemove={handleRemoveFeatured}
                    isUploading={isLoadingFeatured}
                    variant="featured"
                  />
                </CardContent>
              </Card>
              
              {/* Gallery Images Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Gallery Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedImageUpload
                    label="Service Gallery"
                    description="Add multiple images to showcase your service"
                    previewUrls={[...galleryUrls, ...galleryPreviews]}
                    onChange={handleGalleryImagesChange}
                    onUpload={handleGalleryImagesUpload}
                    onRemove={handleRemoveGallery}
                    isUploading={isLoadingGallery}
                    multiple={true}
                    maxFiles={5}
                    variant="gallery"
                  />
                </CardContent>
              </Card>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Service"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}