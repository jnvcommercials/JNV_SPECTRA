import React, { useState } from 'react';
import { EnhancedImageUpload } from '@/components/ui/enhanced-image-upload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function ImageUploadExample() {
  const { toast } = useToast();
  const [hasId, setHasId] = useState(false);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  
  // For featured image
  const [featuredImageFile, setFeaturedImageFile] = useState<File[]>([]);
  const [featuredPreview, setFeaturedPreview] = useState<string[]>([]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  
  // For gallery images
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  
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
    }
  };
  
  // Handle gallery image removal
  const handleRemoveGallery = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    
    // For already uploaded images, in a real app you would send a request to delete from server
    if (galleryUrls[index]) {
      setGalleryUrls(prev => prev.filter((_, i) => i !== index));
    }
  };
  
  // Simulate uploading featured image
  const handleUploadFeatured = async () => {
    if (!hasId) {
      toast({
        title: "Cannot upload yet",
        description: "You need to create the event first (click 'Simulate Create' button)",
        variant: "destructive"
      });
      return;
    }
    
    if (featuredImageFile.length === 0) return;
    
    try {
      setIsLoadingFeatured(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful upload
      const mockUrl = featuredPreview[0];
      setFeaturedImageUrl(mockUrl);
      
      toast({
        title: "Success",
        description: "Featured image uploaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload featured image",
        variant: "destructive"
      });
    } finally {
      setIsLoadingFeatured(false);
    }
  };
  
  // Simulate uploading gallery images
  const handleUploadGallery = async () => {
    if (!hasId) {
      toast({
        title: "Cannot upload yet",
        description: "You need to create the event first (click 'Simulate Create' button)",
        variant: "destructive"
      });
      return;
    }
    
    if (galleryFiles.length === 0) return;
    
    try {
      setIsLoadingGallery(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful upload - we're just using the preview URLs
      const newUrls = galleryPreviews.slice(galleryUrls.length);
      setGalleryUrls(prev => [...prev, ...newUrls]);
      
      toast({
        title: "Success",
        description: `${newUrls.length} gallery images uploaded successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload gallery images",
        variant: "destructive"
      });
    } finally {
      setIsLoadingGallery(false);
    }
  };
  
  // Simulate creating/saving the event to get an ID
  const handleCreateEvent = () => {
    setHasId(true);
    toast({
      title: "Event created",
      description: "Now you can upload images"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Form Example</h2>
        {!hasId && (
          <Button onClick={handleCreateEvent}>
            Simulate Create Event
          </Button>
        )}
        {hasId && (
          <div className="flex items-center gap-2">
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              Event Created
            </div>
            <Button 
              variant="outline" 
              onClick={() => setHasId(false)}
            >
              Reset
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Featured Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Image</CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedImageUpload
              label="Featured Event Image"
              description="This will be displayed as the main image for your event"
              disabled={!hasId}
              disabledMessage="Save the event first before uploading images"
              currentImage={featuredImageUrl}
              previewUrls={featuredPreview}
              onChange={handleFeaturedImageChange}
              onUpload={handleUploadFeatured}
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
              disabled={!hasId}
              disabledMessage="Save the event first before uploading gallery images"
              previewUrls={[...galleryUrls, ...galleryPreviews.slice(galleryUrls.length)]}
              onChange={handleGalleryImagesChange}
              onUpload={handleUploadGallery}
              onRemove={handleRemoveGallery}
              isUploading={isLoadingGallery}
              multiple={true}
              maxFiles={5}
              variant="gallery"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 