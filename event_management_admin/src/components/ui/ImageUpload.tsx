import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";
import { useUploadImage } from "@/api/images";

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  initialImage?: string;
  disabled?: boolean;
}

export function ImageUpload({ 
  onUploadComplete, 
  initialImage, 
  disabled
}: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const uploadImage = useUploadImage();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/image\/(jpeg|png|gif)/)) {
        toast({
          title: "Invalid file type",
          description: "Only JPEG, PNG and GIF images are allowed",
          variant: "destructive",
        });
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage.mutateAsync(selectedImage);
      if (imageUrl) {
        onUploadComplete(imageUrl);
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (disabled) {
    return (
      <div className="p-4 border rounded-md bg-muted">
        <p className="text-sm text-muted-foreground">
          Please create the slide first to upload an image
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          id="image"
          type="file"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleImageChange}
          className="sr-only"
          disabled={isUploading}
        />
        <label
          htmlFor="image"
          className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent"
        >
          <Upload className="h-4 w-4" />
          <span>Choose Image</span>
        </label>
        {selectedImage && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        )}
      </div>
      {selectedImage && (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">
            Selected: {selectedImage.name}
          </p>
        </div>
      )}
      {initialImage && !selectedImage && (
        <div className="mt-2">
          <img
            src={initialImage}
            alt="Current slide"
            className="max-w-full h-auto rounded-md"
          />
        </div>
      )}
    </div>
  );
} 