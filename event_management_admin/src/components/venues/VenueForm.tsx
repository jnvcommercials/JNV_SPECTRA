import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { BulletPoint, Venue } from "@/pages/Venues";
import { EnhancedImageUpload } from "@/components/ui/enhanced-image-upload";
import { useUploadImage, useUploadMultipleImages } from "@/api/images";

const venueSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  location: z.string().min(1, { message: "Location is required" }),
  capacity: z.enum(["50", "100-200", "200-500", "500-1000", "1000+"], {
    required_error: "Capacity is required",
  }),
  venue_type: z.enum(["banquet halls", "Garden and Outdoor venues", "Resorts", "Roof top", "Beach front venues"], {
    required_error: "Venue type is required",
  }),
  space_preference: z.enum(["indoor", "outdoor", "both"], {
    required_error: "Space preference is required",
  }),
  rating: z.number().min(1).max(5, { message: "Rating must be between 1 and 5" }),
  bullet_points: z.array(
    z.object({
      label: z.string().min(1, { message: "Label is required" }),
      value: z.string().min(1, { message: "Value is required" }),
    })
  ).optional(),
  status: z.enum(["active", "inactive"], {
    required_error: "Status is required",
  }),
  featured_image: z.string().optional(),
  additional_images: z.array(z.string()).optional(),
});

type VenueFormValues = z.infer<typeof venueSchema>;

interface VenueFormProps {
  initialData?: Venue;
  onSubmit: (data: VenueFormValues, featuredImage: File | null, additionalImages: File[]) => Promise<void>;
  isLoading?: boolean;
}

export function VenueForm({ initialData, onSubmit, isLoading = false }: VenueFormProps) {
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
  
  const venueId = initialData?.id || "";
  const hasVenueId = !!venueId;
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  
  // Get generic upload mutation hooks
  const uploadImage = useUploadImage();
  const uploadMultipleImages = useUploadMultipleImages();

  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          location: initialData.location || "",
          capacity: initialData.capacity || "50",
          venue_type: initialData.venue_type || "banquet halls",
          space_preference: initialData.space_preference || "indoor",
          rating: initialData.rating || 3,
          bullet_points: initialData.bullet_points || [],
          status: initialData.status === "active" ? "active" : "inactive",
          featured_image: initialData.featured_image,
          additional_images: initialData.additional_images || [],
        }
      : {
          title: "",
          description: "",
          location: "",
          capacity: "50",
          venue_type: "banquet halls",
          space_preference: "indoor",
          rating: 3,
          bullet_points: [{ label: "", value: "" }],
          status: "active",
          featured_image: "",
          additional_images: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bullet_points",
  });

  const handleSubmit = async (values: VenueFormValues) => {
    try {
      console.log('Starting venue form submission...');
      console.log('Form values:', {
        ...values,
        bullet_points: values.bullet_points?.length || 0,
        additional_images: values.additional_images?.length || 0
      });
      
      console.log('Image states:', {
        featuredImageFile: featuredImageFile.length,
        featuredImageUrl,
        galleryFiles: galleryFiles.length,
        galleryUrls: galleryUrls.length,
        galleryPreviews: galleryPreviews.length
      });

      // Convert the first featured image file to the expected format for the API
      const featuredFile = featuredImageFile.length > 0 ? featuredImageFile[0] : null;
      
      console.log('Submitting with:', {
        hasFeaturedFile: !!featuredFile,
        galleryFilesCount: galleryFiles.length
      });
      
      // Submit the form data with the image files
      await onSubmit(values, featuredFile, galleryFiles);
      
      console.log('Venue form submission completed successfully');
    } catch (error) {
      console.error('Error in venue form submission:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

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
    setGalleryFiles(prev => [...prev, ...files]);
    const urls = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews(prev => [...prev, ...urls]);
  };
  
  // Handle featured image removal
  const handleRemoveFeatured = () => {
    setFeaturedImageFile([]);
    setFeaturedPreview([]);
    if (featuredImageUrl) {
      setFeaturedImageUrl(null);
      form.setValue("featured_image", "");
    }
  };
  
  // Handle gallery image removal
  const handleRemoveGallery = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    
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
      console.log("Featured image upload response:", response);
      
      // Handle both object and direct URL string responses
      let imageUrl: string;
      if (typeof response === 'string') {
        // Direct URL string response
        imageUrl = response;
      } else if (response?.data?.url) {
        // Object response with data.url
        imageUrl = response.data.url;
      } else if (response?.url) {
        // Object response with direct url
        imageUrl = response.url;
      } else {
        console.error("Invalid response structure:", response);
        throw new Error("No image URL in response");
      }

      console.log("Extracted image URL:", imageUrl);
      setFeaturedImageUrl(imageUrl);
      form.setValue("featured_image", imageUrl);
      toast({
        title: "Success",
        description: "Featured image uploaded successfully",
      });
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

  const handleGalleryImagesUpload = async () => {
    if (galleryFiles.length === 0) return;
    
    try {
      setIsLoadingGallery(true);
      
      const response = await uploadMultipleImages.mutateAsync(galleryFiles);
      console.log("Gallery images upload response:", response);
      
      // Handle both array and object responses
      let urls: string[];
      if (Array.isArray(response)) {
        // Direct array of URLs
        urls = response;
      } else if (response?.data?.urls) {
        // Object response with data.urls
        urls = response.data.urls;
      } else if (response?.urls) {
        // Object response with direct urls
        urls = response.urls;
      } else {
        console.error("Invalid response structure:", response);
        throw new Error("No image URLs in response");
      }

      console.log("Extracted image URLs:", urls);
      const newUrls = [...galleryUrls, ...urls];
      setGalleryUrls(newUrls);
      form.setValue("additional_images", newUrls);
      toast({
        title: "Success",
        description: "Gallery images uploaded successfully",
      });
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter venue title" {...field} />
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
                    <Textarea
                      placeholder="Enter venue description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter venue location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select capacity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100-200">100-200</SelectItem>
                      <SelectItem value="200-500">200-500</SelectItem>
                      <SelectItem value="500-1000">500-1000</SelectItem>
                      <SelectItem value="1000+">1000+</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venue_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select venue type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="banquet halls">Banquet Halls</SelectItem>
                      <SelectItem value="Garden and Outdoor venues">Garden and Outdoor Venues</SelectItem>
                      <SelectItem value="Resorts">Resorts</SelectItem>
                      <SelectItem value="Roof top">Roof Top</SelectItem>
                      <SelectItem value="Beach front venues">Beach Front Venues</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="space_preference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Space Preference</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select space preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="indoor">Indoor</SelectItem>
                      <SelectItem value="outdoor">Outdoor</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 Star</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Featured Image</FormLabel>
              <EnhancedImageUpload
                label="Featured Image"
                description="Recommended size: 1200 x 800px (3:2 ratio). Max 5MB."
                currentImage={featuredImageUrl}
                previewUrls={featuredPreview}
                onChange={handleFeaturedImageChange}
                onUpload={handleFeaturedImageUpload}
                onRemove={handleRemoveFeatured}
                isUploading={isLoadingFeatured}
                disabled={false}
                maxFiles={1}
                variant="featured"
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Gallery Images</FormLabel>
              <EnhancedImageUpload
                label="Gallery Images"
                description="Upload up to 5 additional images. Recommended size: 1200 x 800px (3:2 ratio). Max 5MB each."
                currentImage={galleryUrls[0]}
                previewUrls={[...galleryUrls, ...galleryPreviews]}
                onChange={handleGalleryImagesChange}
                onUpload={handleGalleryImagesUpload}
                onRemove={handleRemoveGallery}
                isUploading={isLoadingGallery}
                disabled={false}
                multiple={true}
                maxFiles={5}
                variant="gallery"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bullet Points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-4">
                <FormField
                  control={form.control}
                  name={`bullet_points.${index}.label`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Label" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`bullet_points.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Value" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ label: "", value: "" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Bullet Point
            </Button>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {initialData ? "Update Venue" : "Create Venue"}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
} 