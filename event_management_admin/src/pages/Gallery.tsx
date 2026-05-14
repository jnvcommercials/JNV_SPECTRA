import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGalleries, useCreateGallery, useUpdateGallery, useDeleteGallery } from "@/api/gallery";
import { EnhancedImageUpload } from "@/components/ui/enhanced-image-upload";
import { useUploadMultipleImages } from "@/api/images";

export default function Gallery() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGallery, setEditingGallery] = useState(null);
  const { toast } = useToast();
  const { data: galleriesData, isLoading } = useGalleries();
  const galleries = galleriesData || [];
  const createGallery = useCreateGallery();
  const updateGallery = useUpdateGallery();
  const deleteGallery = useDeleteGallery();

  const handleGalleryCreated = () => {
    setShowCreateForm(false);
    setEditingGallery(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteGallery.mutateAsync(id);
      toast({
        title: "Success",
        description: "Gallery deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete gallery",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-8">Gallery Management</h1>

        <div className="grid gap-6">
          <div className="flex justify-end">
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Gallery
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Gallery</DialogTitle>
                </DialogHeader>
                <GalleryForm gallery={null} onSuccess={handleGalleryCreated} />
              </DialogContent>
            </Dialog>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Galleries</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Tagline</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Loading galleries...
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(galleries) || galleries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No galleries found
                    </TableCell>
                  </TableRow>
                ) : (
                  galleries.map((gallery) => (
                    <TableRow key={gallery.id}>
                      <TableCell>{gallery.title}</TableCell>
                      <TableCell>{gallery.tagline}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {gallery.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Gallery ${index + 1}`}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingGallery(gallery)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(gallery.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {editingGallery && (
          <Dialog open={!!editingGallery} onOpenChange={() => setEditingGallery(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Gallery</DialogTitle>
              </DialogHeader>
              <GalleryForm
                gallery={editingGallery}
                onSuccess={handleGalleryCreated}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}

function GalleryForm({ gallery, onSuccess }) {
  const [title, setTitle] = useState(gallery?.title || "");
  const [tagline, setTagline] = useState(gallery?.tagline || "");
  const [images, setImages] = useState<string[]>(gallery?.images || []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const createGallery = useCreateGallery();
  const updateGallery = useUpdateGallery();
  const uploadMultipleImages = useUploadMultipleImages();

  const handleImageChange = (files: File[]) => {
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      const urls = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...urls]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (images[index]) {
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
    }
  };

  const handleImageUpload = async () => {
    if (imageFiles.length === 0) return;
    
    try {
      setIsUploading(true);
      const response = await uploadMultipleImages.mutateAsync(imageFiles);
      
      if (response && Array.isArray(response)) {
        const newImages = [...images, ...response];
        setImages(newImages);
        setImageFiles([]);
        setImagePreviews([]);
        toast({
          title: "Success",
          description: "Images uploaded successfully",
        });
      } else {
        throw new Error("Invalid image URLs received from server");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const galleryData = {
        title,
        tagline,
        images,
      };

      if (gallery) {
        await updateGallery.mutateAsync({ id: gallery.id, ...galleryData });
        toast({
          title: "Success",
          description: "Gallery updated successfully",
        });
      } else {
        await createGallery.mutateAsync(galleryData);
        toast({
          title: "Success",
          description: "Gallery created successfully",
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Textarea
          id="tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <EnhancedImageUpload
          label="Gallery Images"
          description="Upload multiple images for your gallery"
          previewUrls={[...images, ...imagePreviews]}
          onChange={handleImageChange}
          onUpload={handleImageUpload}
          onRemove={handleRemoveImage}
          isUploading={isUploading}
          multiple={true}
          maxFiles={10}
          variant="gallery"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => onSuccess()}>
          Cancel
        </Button>
        <Button type="submit">
          {gallery ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
} 