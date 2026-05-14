import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial } from "@/api/testimonials";
import { useUploadImage } from "@/api/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Star } from "lucide-react";
import { EnhancedImageUpload } from "@/components/ui/enhanced-image-upload";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface TestimonialFormData {
  id?: string;
  client_name: string;
  location: string;
  rating: number;
  feedback: string;
  featured_image_url: string;
  status: "active" | "inactive";
}

function TestimonialsContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<TestimonialFormData | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>({
    client_name: "",
    location: "",
    rating: 5,
    feedback: "",
    featured_image_url: "",
    status: "active",
  });
  const [formErrors, setFormErrors] = useState<Partial<TestimonialFormData>>({});

  // Separate image states for create form
  const [createFeaturedImageFile, setCreateFeaturedImageFile] = useState<File[]>([]);
  const [createFeaturedPreview, setCreateFeaturedPreview] = useState<string[]>([]);
  const [isLoadingCreateFeatured, setIsLoadingCreateFeatured] = useState(false);

  // Separate image states for edit form
  const [editFeaturedImageFile, setEditFeaturedImageFile] = useState<File[]>([]);
  const [editFeaturedPreview, setEditFeaturedPreview] = useState<string[]>([]);
  const [isLoadingEditFeatured, setIsLoadingEditFeatured] = useState(false);

  const queryClient = useQueryClient();
  const { data: testimonialsData, isLoading } = useTestimonials();
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial(selectedTestimonial?.id || "");
  const deleteTestimonial = useDeleteTestimonial();
  const uploadImage = useUploadImage();

  const testimonials = testimonialsData?.data?.data || [];

  // Handle featured image selection for create form
  const handleCreateFeaturedImageChange = (files: File[]) => {
    if (files.length > 0) {
      setCreateFeaturedImageFile(files);
      const urls = files.map(file => URL.createObjectURL(file));
      setCreateFeaturedPreview(urls);
    }
  };

  // Handle featured image selection for edit form
  const handleEditFeaturedImageChange = (files: File[]) => {
    if (files.length > 0) {
      setEditFeaturedImageFile(files);
      const urls = files.map(file => URL.createObjectURL(file));
      setEditFeaturedPreview(urls);
    }
  };

  // Handle featured image removal for create form
  const handleRemoveCreateFeatured = () => {
    setCreateFeaturedImageFile([]);
    setCreateFeaturedPreview([]);
    setFormData(prev => ({ ...prev, featured_image_url: "" }));
  };

  // Handle featured image removal for edit form
  const handleRemoveEditFeatured = () => {
    setEditFeaturedImageFile([]);
    setEditFeaturedPreview([]);
    if (selectedTestimonial) {
      setSelectedTestimonial(prev => prev ? { ...prev, featured_image_url: "" } : null);
    }
  };

  // Handle featured image upload for create form
  const handleCreateFeaturedImageUpload = async () => {
    if (createFeaturedImageFile.length === 0) return;
    
    try {
      setIsLoadingCreateFeatured(true);
      
      const response = await uploadImage.mutateAsync(createFeaturedImageFile[0]);
      
      if (response) {
        setFormData(prev => ({ ...prev, featured_image_url: response }));
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
      setIsLoadingCreateFeatured(false);
    }
  };

  // Handle featured image upload for edit form
  const handleEditFeaturedImageUpload = async () => {
    if (editFeaturedImageFile.length === 0) return;
    
    try {
      setIsLoadingEditFeatured(true);
      
      const response = await uploadImage.mutateAsync(editFeaturedImageFile[0]);
      
      if (response && selectedTestimonial) {
        setSelectedTestimonial(prev => prev ? { ...prev, featured_image_url: response } : null);
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
      setIsLoadingEditFeatured(false);
    }
  };

  const validateForm = (data: TestimonialFormData) => {
    const errors: Partial<TestimonialFormData> = {};
    
    if (!data.client_name) {
      errors.client_name = "Client name is required";
    }
    
    if (!data.location) {
      errors.location = "Location is required";
    }
    
    if (!data.feedback || data.feedback.length < 10) {
      errors.feedback = "Feedback must be at least 10 characters long";
    }
    
    if (!data.featured_image_url) {
      errors.featured_image_url = "Featured image is required";
    }
    
    return errors;
  };

  const handleCreate = async () => {
    const errors = validateForm(formData);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await createTestimonial.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      setFormData({
        client_name: "",
        location: "",
        rating: 5,
        feedback: "",
        featured_image_url: "",
        status: "active",
      });
      setFormErrors({});
      toast({
        title: "Success",
        description: "Testimonial created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create testimonial",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedTestimonial) return;
    
    const errors = validateForm(selectedTestimonial);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const testimonialData = {
        ...selectedTestimonial,
        id: selectedTestimonial.id?.toString()
      };
      
      await updateTestimonial.mutateAsync(testimonialData);
      setIsEditDialogOpen(false);
      setSelectedTestimonial(null);
      setFormErrors({});
      toast({
        title: "Success",
        description: "Testimonial updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update testimonial",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTestimonial.mutateAsync(id);
      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Testimonials</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Testimonial</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Client Name"
                  value={formData.client_name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, client_name: e.target.value }));
                    setFormErrors(prev => ({ ...prev, client_name: undefined }));
                  }}
                />
                {formErrors.client_name && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.client_name}</p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, location: e.target.value }));
                    setFormErrors(prev => ({ ...prev, location: undefined }));
                  }}
                />
                {formErrors.location && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.location}</p>
                )}
              </div>
              <Select
                value={formData.rating.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} Stars
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <Textarea
                  placeholder="Feedback"
                  value={formData.feedback}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, feedback: e.target.value }));
                    if (e.target.value.length >= 10) {
                      setFormErrors(prev => ({ ...prev, feedback: undefined }));
                    }
                  }}
                  className="min-h-[100px]"
                />
                {formErrors.feedback && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.feedback}</p>
                )}
              </div>
              <EnhancedImageUpload
                label="Featured Image"
                description="Upload a featured image for the testimonial"
                currentImage={formData.featured_image_url}
                previewUrls={createFeaturedPreview}
                onChange={handleCreateFeaturedImageChange}
                onUpload={handleCreateFeaturedImageUpload}
                onRemove={handleRemoveCreateFeatured}
                isUploading={isLoadingCreateFeatured}
                variant="featured"
              />
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as "active" | "inactive" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleCreate} 
                disabled={createTestimonial.isPending}
              >
                {createTestimonial.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Testimonials</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(testimonials) && testimonials.length > 0 ? (
                testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell>{testimonial.client_name}</TableCell>
                    <TableCell>{testimonial.location}</TableCell>
                    <TableCell>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        testimonial.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {testimonial.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedTestimonial(testimonial);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(testimonial.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No testimonials found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
          </DialogHeader>
          {selectedTestimonial && (
            <div className="space-y-4">
              <Input
                placeholder="Client Name"
                value={selectedTestimonial.client_name}
                onChange={(e) => setSelectedTestimonial(prev => prev ? { ...prev, client_name: e.target.value } : null)}
              />
              <Input
                placeholder="Location"
                value={selectedTestimonial.location}
                onChange={(e) => setSelectedTestimonial(prev => prev ? { ...prev, location: e.target.value } : null)}
              />
              <Select
                value={selectedTestimonial.rating.toString()}
                onValueChange={(value) => setSelectedTestimonial(prev => prev ? { ...prev, rating: parseInt(value) } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} Stars
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <Textarea
                  placeholder="Feedback"
                  value={selectedTestimonial.feedback}
                  onChange={(e) => {
                    setSelectedTestimonial(prev => prev ? { ...prev, feedback: e.target.value } : null);
                    if (e.target.value.length >= 10) {
                      setFormErrors(prev => ({ ...prev, feedback: undefined }));
                    }
                  }}
                  className="min-h-[100px]"
                />
                {formErrors.feedback && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.feedback}</p>
                )}
              </div>
              <EnhancedImageUpload
                label="Featured Image"
                description="Upload a featured image for the testimonial"
                currentImage={selectedTestimonial.featured_image_url}
                previewUrls={editFeaturedPreview}
                onChange={handleEditFeaturedImageChange}
                onUpload={handleEditFeaturedImageUpload}
                onRemove={handleRemoveEditFeatured}
                isUploading={isLoadingEditFeatured}
                variant="featured"
              />
              <Select
                value={selectedTestimonial.status}
                onValueChange={(value) => setSelectedTestimonial(prev => prev ? { ...prev, status: value as "active" | "inactive" } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleEdit} 
                disabled={updateTestimonial.isPending}
              >
                {updateTestimonial.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Testimonials() {
  return (
    <DashboardLayout>
      <TestimonialsContent />
    </DashboardLayout>
  );
} 