import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Upload, AlertCircle, Plus, Trash2 } from "lucide-react";
import { useUploadImage, useUploadMultipleImages } from "@/api/images";
import { useToast } from "@/hooks/use-toast";
import { EnhancedImageUpload } from "@/components/ui/enhanced-image-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Rental, BulletPoint } from "@/pages/Rentals";
import { useCreateRental, useUpdateRental } from "@/api/rentals";

const rentalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  featured_image: z.string().optional(),
  gallery_images: z.array(z.string()).optional(),
  bullet_points: z.array(
    z.object({
      key: z.string(),
      value: z.string()
    })
  ).optional(),
  status: z.enum(["active", "inactive"]).default("active")
});

type RentalFormValues = z.infer<typeof rentalSchema>;

interface RentalFormProps {
  initialData?: Partial<Rental>;
  onSubmit: (values: RentalFormValues, featuredImage: File | null, additionalImages: File[]) => Promise<void>;
  isLoading?: boolean;
}

export function RentalForm({ initialData, onSubmit, isLoading }: RentalFormProps) {
  const { toast } = useToast();
  const [featuredImageFile, setFeaturedImageFile] = useState<File[]>([]);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [featuredPreview, setFeaturedPreview] = useState<string[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  const form = useForm<z.infer<typeof rentalSchema>>({
    resolver: zodResolver(rentalSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      featured_image: initialData?.featured_image || "",
      gallery_images: initialData?.gallery_images || [],
      bullet_points: initialData?.bullet_points || [],
      status: initialData?.status || "active"
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bullet_points",
  });

  // Image upload hooks
  const uploadImage = useUploadImage();
  const uploadMultipleImages = useUploadMultipleImages();

  // Handle featured image selection
  const handleFeaturedImageChange = (files: File[]) => {
    setFeaturedImageFile(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setFeaturedPreview(urls);
  };

  // Handle gallery images selection
  const handleGalleryImagesChange = (files: File[]) => {
    setAdditionalImageFiles(prev => [...prev, ...files]);
    const urls = files.map(file => URL.createObjectURL(file));
    setAdditionalPreviews(prev => [...prev, ...urls]);
  };

  // Handle featured image removal
  const handleRemoveFeatured = () => {
    setFeaturedImageFile([]);
    setFeaturedPreview([]);
    form.setValue("featured_image", "");
  };
  
  // Handle gallery image removal
  const handleRemoveGallery = (index: number) => {
    setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index));
    setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
    
    const currentImages = form.getValues("gallery_images") || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    form.setValue("gallery_images", newImages);
  };

  // Handle featured image upload
  const handleFeaturedImageUpload = async () => {
    if (featuredImageFile.length === 0) return;

    try {
      setIsLoadingFeatured(true);
      
      const response = await uploadImage.mutateAsync(featuredImageFile[0]);
      
      if (response) {
        form.setValue("featured_image", response);
        toast({
          title: "Success",
          description: "Featured image uploaded successfully",
        });
      } else {
        throw new Error("No image URL in response");
      }
    } catch (error) {
      console.error("Error uploading featured image:", error);
      toast({
        title: "Error",
        description: "Failed to upload featured image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFeatured(false);
    }
  };

  // Handle gallery images upload
  const handleGalleryImagesUpload = async () => {
    if (additionalImageFiles.length === 0) return;

    try {
      setIsLoadingGallery(true);
      
      const response = await uploadMultipleImages.mutateAsync(additionalImageFiles);
      console.log("Gallery upload response:", response);
      
      // Handle both response formats
      let urls: string[];
      if (Array.isArray(response)) {
        // Direct array of URLs
        urls = response;
      } else if (response?.data?.urls && Array.isArray(response.data.urls)) {
        // Nested data.urls structure
        urls = response.data.urls;
      } else {
        console.error("Invalid response structure:", response);
        throw new Error("Invalid response from server");
      }

      if (urls.length > 0) {
        // Ensure currentImages is always an array
        const currentImages = form.getValues("gallery_images") || [];
        const newImages = Array.isArray(currentImages) ? [...currentImages, ...urls] : urls;
        form.setValue("gallery_images", newImages);
        toast({
          title: "Success",
          description: "Gallery images uploaded successfully",
        });
      } else {
        throw new Error("No image URLs in response");
      }
    } catch (error) {
      console.error("Error uploading gallery images:", error);
      toast({
        title: "Error",
        description: "Failed to upload gallery images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const handleSubmit = async (values: RentalFormValues) => {
    try {
      console.log("Update rental button clicked with values:", values);
      console.log("Form state:", {
        isDirty: form.formState.isDirty,
        isSubmitting: form.formState.isSubmitting,
        isValid: form.formState.isValid,
        errors: form.formState.errors
      });

      // Format the data
      const formData = {
        ...values,
        bullet_points: values.bullet_points?.filter(point => point.key.trim() || point.value.trim()) || [],
        gallery_images: values.gallery_images || []
      };

      console.log("Submitting rental form with data:", formData);

      // Submit the form
      await onSubmit(
        formData, 
        featuredImageFile.length > 0 ? featuredImageFile[0] : null, 
        additionalImageFiles
      );

      // Clear form state after successful submission
      if (!initialData?.id) {
        form.reset();
        setFeaturedImageFile([]);
        setAdditionalImageFiles([]);
        setFeaturedPreview([]);
        setAdditionalPreviews([]);
      }

    } catch (error) {
      console.error("Error submitting rental form:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to save rental. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?.id ? "Edit Rental" : "Create New Rental"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rental Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Wedding Decor Package" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Complete wedding decoration package that transforms your venue..." 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Bullet Points</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ key: "", value: "" })}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Point
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name="bullet_points"
                render={() => (
                  <FormItem>
                    <FormLabel>Bullet Points</FormLabel>
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-start">
                          <div className="flex-1 space-y-2">
                            <FormField
                              control={form.control}
                              name={`bullet_points.${index}.key`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Key" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`bullet_points.${index}.value`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Value" {...field} />
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
                            className="mt-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ key: "", value: "" })}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bullet Point
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
              <FormDescription>
                Add title-description pairs to highlight important features
              </FormDescription>
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
                    label="Featured Rental Image"
                    description="This will be displayed as the main image for your rental"
                    currentImage={initialData?.featured_image}
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
                    label="Rental Gallery"
                    description="Add multiple images to showcase your rental"
                    previewUrls={[...(Array.isArray(initialData?.gallery_images) ? initialData.gallery_images : []), ...additionalPreviews]}
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
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => form.reset()}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Upload className="mr-2 h-4 w-4 animate-spin" />}
              {initialData?.id ? "Update Rental" : "Create Rental"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
