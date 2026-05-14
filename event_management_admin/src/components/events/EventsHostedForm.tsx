import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { EventHosted } from "@/pages/EventsHosted";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { EventHostedFormData } from "@/api/events-hosted";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EnhancedImageUpload } from "@/components/ui/enhanced-image-upload";
import { useUploadImage, useUploadMultipleImages } from "@/api/images";

const eventsHostedSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  event_type: z.string().min(1, { message: "Event type is required" }),
  date: z.date({
    required_error: "Event date is required",
  }),
  location: z.string().min(1, { message: "Location is required" }),
  status: z.enum(["completed", "cancelled"]),
  feedback: z.string().min(1, { message: "Feedback is required" }),
  rating: z.number().min(0).max(5),
  gallery_images: z.array(z.string()).optional(),
  featured_image: z.string().optional(),
});

type FormValues = z.infer<typeof eventsHostedSchema>;

interface EventsHostedFormProps {
  initialData?: EventHosted;
  onSubmit: (data: EventHostedFormData, galleryImages: File[]) => Promise<void>;
  isLoading?: boolean;
}

export function EventsHostedForm({ initialData, onSubmit, isLoading = false }: EventsHostedFormProps) {
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
    initialData?.gallery_images || []
  );
  
  const eventId = initialData?.id || "";
  const hasEventId = !!eventId;
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const uploadImage = useUploadImage();
  const uploadMultipleImages = useUploadMultipleImages();

  const form = useForm<FormValues>({
    resolver: zodResolver(eventsHostedSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          event_type: initialData.event_type,
          date: new Date(initialData.date),
          location: initialData.location,
          status: initialData.status,
          feedback: initialData.feedback,
          rating: initialData.rating,
          gallery_images: initialData.gallery_images || [],
          featured_image: initialData.featured_image || "",
        }
      : {
          title: "",
          description: "",
          event_type: "",
          date: new Date(),
          location: "",
          status: "completed",
          feedback: "",
          rating: 0,
          gallery_images: [],
          featured_image: "",
        },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      // Convert to the API expected format
      const formData: EventHostedFormData = {
        title: values.title,
        description: values.description,
        event_type: values.event_type,
        date: values.date,
        location: values.location,
        status: values.status,
        feedback: values.feedback,
        rating: values.rating,
        gallery_images: values.gallery_images,
        featured_image: values.featured_image
      };

      // Include any new selected files for gallery
      await onSubmit(formData, galleryFiles);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
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
      // In a real app, you might want to send a request to delete the image on the server
      setFeaturedImageUrl(null);
      form.setValue("featured_image", "");
    }
  };
  
  // Handle gallery image removal
  const handleRemoveGallery = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    
    // For already uploaded images, in a real app you would send a request to delete from server
    if (galleryUrls[index]) {
      const newUrls = galleryUrls.filter((_, i) => i !== index);
      setGalleryUrls(newUrls);
      form.setValue("gallery_images", newUrls);
    }
  };
  
  const handleFeaturedImageUpload = async () => {
    if (featuredImageFile.length === 0) return;
    try {
      setIsLoadingFeatured(true);
      const result = await uploadImage.mutateAsync(featuredImageFile[0]);
      if (result) {
        form.setValue('featured_image', result);
        setFeaturedImageUrl(result);
      }
    } catch (error) {
      console.error('Error uploading featured image:', error);
    } finally {
      setIsLoadingFeatured(false);
    }
  };
  
  const handleGalleryImagesUpload = async () => {
    try {
      setIsLoadingGallery(true);
      
      // Pass the entire array of files to the mutation
      const response = await uploadMultipleImages.mutateAsync(galleryFiles);
      
      // Extract URLs from response
      let newUrls: string[] = [];
      if (response?.data?.gallery_images) {
        // Extract just the URLs from gallery_images objects
        newUrls = response.data.gallery_images.map(img => 
          typeof img === 'string' ? img : img.url
        );
      }
      
      if (newUrls.length > 0) {
        // Update the form with new gallery images
        const currentGalleryImages = form.getValues('gallery_images') || [];
        form.setValue('gallery_images', [...currentGalleryImages, ...newUrls]);
        
        toast({
          title: "Success",
          description: "Gallery images uploaded successfully",
        });
      }
    } catch (error) {
      console.error("Error uploading gallery images:", error);
      toast({
        title: "Error",
        description: "Failed to upload gallery images",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGallery(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Hosted Event" : "Record Hosted Event"}</CardTitle>
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
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Annual Corporate Gala" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="event_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="birthday">Birthday</SelectItem>
                      </SelectContent>
                    </Select>
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
                      placeholder="A prestigious evening celebrating company achievements..." 
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
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                      <Input placeholder="Grand Ballroom, Hilton Hotel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Status</FormLabel>
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
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Client/attendee feedback about the event..." 
                        className="min-h-[80px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (0-5)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="5" 
                        step="0.1" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    label="Featured Event Image"
                    description="This will be displayed as the main image for your event"
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
                    label="Event Gallery"
                    description="Add multiple images to showcase your event"
                    previewUrls={[...galleryUrls, ...galleryPreviews.slice(galleryUrls.length)]}
                    onChange={handleGalleryImagesChange}
                    onUpload={handleGalleryImagesUpload}
                    onRemove={handleRemoveGallery}
                    isUploading={isLoadingGallery}
                    multiple={true}
                    maxFiles={10}
                    variant="gallery"
                  />
                </CardContent>
              </Card>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Update Event Record" : "Save Event Record"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}