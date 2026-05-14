import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { EnhancedImageUpload } from "@/components/ui/enhanced-image-upload";
import { useUploadFeaturedImage, useUploadGalleryImages } from "@/api/events";

// Validation schema
const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["active", "inactive"]).default("active"),
  featured_image: z.string().optional(),
  additional_images: z.array(z.string()).default([]),
  bullet_points: z.array(z.object({
    label: z.string().min(1, "Label is required"),
    value: z.string().min(1, "Value is required")
  })).default([]),
  pricing: z.union([
    z.number(),
    z.string().transform((val) => {
      const num = Number(val.replace(/[^0-9.-]+/g, ''));
      return isNaN(num) ? 0 : num;
    })
  ]).default(0),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  initialData?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void;
  isLoading?: boolean;
}

export function EventForm({ initialData, onSubmit, isLoading }: EventFormProps) {
  const { toast } = useToast();
  const uploadFeaturedImage = useUploadFeaturedImage();
  const uploadGalleryImages = useUploadGalleryImages();
  
  // Featured image state
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(initialData?.featured_image || null);
  const [featuredUrl, setFeaturedUrl] = useState<string | null>(initialData?.featured_image || null);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);

  // Gallery images state
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    Array.isArray(initialData?.additional_images) ? initialData.additional_images : []
  );
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      status: initialData?.status || "active",
      featured_image: initialData?.featured_image || "",
      additional_images: Array.isArray(initialData?.additional_images) ? initialData.additional_images : [],
      bullet_points: Array.isArray(initialData?.bullet_points) ? initialData.bullet_points : [],
      pricing: typeof initialData?.pricing === 'number' ? initialData.pricing : 0,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bullet_points"
  });

  // Sync form value on galleryUrls change
  useEffect(() => {
    form.setValue("additional_images", galleryUrls, { shouldDirty: true });
  }, [galleryUrls, form]);

  // Sync form value with featuredUrl
  useEffect(() => {
    form.setValue("featured_image", featuredUrl || "", { shouldDirty: true });
  }, [featuredUrl, form]);

  const handleSubmit = async (values: EventFormValues) => {
    try {
      console.log('[EventForm] Starting form submission', {
        triggerType: 'form_submit',
        action: initialData ? 'update_event' : 'create_event',
        timestamp: new Date().toISOString(),
        values
      });

      // Prepare submission data
      const submissionData = {
        ...values,
        pricing: Number(values.pricing) || 0,
        additional_images: galleryUrls,
      };

      await onSubmit(submissionData);

      console.log('[EventForm] Form submission successful', {
        triggerType: 'form_submit',
        action: initialData ? 'update_event' : 'create_event',
        timestamp: new Date().toISOString(),
        submissionData
      });
    } catch (error) {
      console.error('[EventForm] Form submission error:', {
        triggerType: 'form_submit',
        action: initialData ? 'update_event' : 'create_event',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const handleFeaturedUpload = async () => {
    if (!featuredFile) return;
    try {
      setIsLoadingFeatured(true);
      const url = await uploadFeaturedImage.mutateAsync(featuredFile);
      setFeaturedUrl(url);
      setFeaturedFile(null);
      setFeaturedPreview(null);
      toast({ title: "Featured image uploaded successfully" });
    } catch {
      toast({ title: "Failed to upload featured image", variant: "destructive" });
    } finally {
      setIsLoadingFeatured(false);
    }
  };

  const handleGalleryChange = (files: File[]) => {
    setGalleryFiles(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setGalleryPreviews(prev => [...prev, ...previews]);
  };

  const handleGalleryUpload = async () => {
    if (!galleryFiles.length) return;
    try {
      setIsLoadingGallery(true);
      const urls = await uploadGalleryImages.mutateAsync(galleryFiles);
      // Update galleryUrls with just the URLs (strings)
      setGalleryUrls(prev => [...prev, ...urls]);
      setGalleryFiles([]);
      setGalleryPreviews([]);
      toast({ title: "Gallery images uploaded successfully" });
    } catch {
      toast({ title: "Failed to upload gallery images", variant: "destructive" });
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const handleRemoveGallery = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    setGalleryUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <DialogHeader className="px-6 pt-6">
        <DialogTitle>{initialData ? "Edit Event" : "Create Event"}</DialogTitle>
        <DialogDescription>
          {initialData ? "Update the details of your event." : "Add a new event to your calendar."}
        </DialogDescription>
      </DialogHeader>

      <div className="px-6 py-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Featured Image Upload */}
            <EnhancedImageUpload
              label="Featured Image"
              description="Recommended size: 1200 x 800px. Max 5MB."
              previewUrls={featuredPreview ? [featuredPreview] : []}
              currentImage={featuredUrl || undefined}
              onChange={(files) => {
                if (files.length) {
                  setFeaturedFile(files[0]);
                  setFeaturedPreview(URL.createObjectURL(files[0]));
                }
              }}
              onUpload={handleFeaturedUpload}
              onRemove={() => {
                setFeaturedFile(null);
                setFeaturedPreview(null);
                setFeaturedUrl(null);
                form.setValue("featured_image", "");
              }}
              isUploading={isLoadingFeatured}
              variant="featured"
            />

            {/* Gallery Images Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Gallery Images</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedImageUpload
                  label="Event Gallery"
                  description="Add multiple images for your event"
                  previewUrls={[...galleryPreviews, ...galleryUrls]}
                  onChange={handleGalleryChange}
                  onUpload={handleGalleryUpload}
                  onRemove={handleRemoveGallery}
                  isUploading={isLoadingGallery}
                  multiple
                  variant="gallery"
                />
              </CardContent>
            </Card>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Event title" {...field} />
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
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
                    <Textarea placeholder="Describe the event" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Pricing & Bullet Points */}
            <div className="space-y-4">

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>Bullet Points</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ label: "", value: "" })}>
                    <Plus className="mr-2 h-4 w-4" /> Add Point
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                    <FormField
                      control={form.control}
                      name={`bullet_points.${index}.label`}
                      render={({ field }) => (
                        <FormItem>
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
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Value" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                <FormDescription>Add key features</FormDescription>
              </div>
            </div>
            {/* Submit Button */}
            <DialogFooter>
              <Button asChild className="w-full md:w-auto">
                <button 
                  type="submit" 
                  disabled={isLoading || isLoadingFeatured || isLoadingGallery}
                  onClick={() => {
                    try {
                      const formState = form.getValues();
                      const formErrors = form.formState.errors;
                      const isFormValid = form.formState.isValid;
                      const isDirty = form.formState.isDirty;
                      const isSubmitting = form.formState.isSubmitting;

                      // Enhanced error logging
                      if (Object.keys(formErrors).length > 0) {
                        console.error('[EventForm] Form validation failed', {
                          errors: formErrors,
                          timestamp: new Date().toISOString(),
                          formState: {
                            ...formState,
                            bullet_points: formState.bullet_points?.map((point, index) => ({
                              ...point,
                              errors: {
                                label: formErrors.bullet_points?.[index]?.label?.message,
                                value: formErrors.bullet_points?.[index]?.value?.message
                              }
                            }))
                          }
                        });

                        // Show toast for validation errors
                        const errorMessages = Object.entries(formErrors)
                          .map(([field, error]) => {
                            if (field === 'bullet_points' && Array.isArray(error)) {
                              return error.map((e: any, i: number) => 
                                `Bullet point ${i + 1}: ${e.label?.message || e.value?.message || 'Invalid data'}`
                              ).join(', ');
                            }
                            if (field === 'pricing') {
                              return 'Pricing must be a valid number';
                            }
                            return typeof error === 'object' && error !== null ? error.message : String(error);
                          })
                          .filter(Boolean)
                          .join(', ');

                        toast({
                          title: "Validation Error",
                          description: errorMessages || "Please check your input",
                          variant: "destructive",
                        });
                      }

                      console.log('[EventForm] Form submission triggered', {
                        triggerType: 'button_click',
                        action: initialData ? 'update_event' : 'create_event',
                        timestamp: new Date().toISOString(),
                        formState,
                        hasFeaturedImage: !!featuredUrl,
                        galleryImageCount: galleryUrls.length,
                        validation: {
                          isValid: isFormValid,
                          isDirty,
                          isSubmitting,
                          errors: formErrors
                        },
                        loadingStates: {
                          isLoading,
                          isLoadingFeatured,
                          isLoadingGallery
                        }
                      });
                    } catch (error) {
                      console.error('[EventForm] Error during button click logging', {
                        error: error instanceof Error ? error.message : 'Unknown error',
                        stack: error instanceof Error ? error.stack : undefined,
                        timestamp: new Date().toISOString()
                      });
                    }
                  }}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {initialData ? "Update Event" : "Create Event"}
                </button>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </div>
    </>
  );
} 