import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slide, useDeleteSlider, useUpdateSlider } from "@/api/sliders";
import { Trash2, Pencil, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { SliderEditor } from "./SliderEditor";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface SliderListProps {
  slides: Slide[];
  isLoading: boolean;
  onReorder: () => void;
}

export function SliderList({ slides, isLoading, onReorder }: SliderListProps) {
  const { toast } = useToast();
  const deleteSlider = useDeleteSlider();
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const updateSlider = useUpdateSlider(editingSlide?.id || "");

  const handleDelete = async (slide: Slide) => {
    try {
      await deleteSlider.mutateAsync(slide.id);
      onReorder();
      toast({
        title: "Success",
        description: "Slide deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete slide",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = (formData: any) => {
    if (editingSlide) {
      updateSlider.mutate(
        {
          ...editingSlide,
          ...formData,
        },
        {
          onSuccess: () => {
            setEditingSlide(null);
            onReorder();
            toast({
              title: "Success",
              description: "Slide updated successfully",
            });
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to update slide",
              variant: "destructive",
            });
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No slides found</h3>
        <p className="text-muted-foreground mt-2">Create a new slide to get started with your slider</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {slides.map((slide) => (
          <Card key={slide.id} className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                  {slide.image ? (
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{slide.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">Order: {slide.order}</Badge>
                    {slide.status === 'active' ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingSlide(slide)}
                  className="hover:bg-primary/10"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(slide)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingSlide} onOpenChange={() => setEditingSlide(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Slide</DialogTitle>
          </DialogHeader>
          {editingSlide && (
            <SliderEditor
              sliderType={editingSlide.slider_name}
              onSlideCreated={handleUpdate}
              currentOrder={editingSlide.order}
              initialData={editingSlide}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 