import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Plus } from "lucide-react";

interface MultiImageUploadProps {
  values: string[];
  onChange: (value: File) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
  maxImages?: number;
  maxSizeMB?: number;
}

export function MultiImageUpload({
  values = [],
  onChange,
  onRemove,
  disabled,
  maxImages = 5,
  maxSizeMB = 2,
}: MultiImageUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check file size (default 2MB limit)
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    
    // Check file type
    if (!file.type.includes("image")) {
      setError("File must be an image");
      return;
    }
    
    // Check max images
    if (values.length >= maxImages) {
      setError(`Maximum of ${maxImages} images allowed`);
      return;
    }
    
    setError(null);
    onChange(file);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {values.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
            <img src={url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
            <Button
              className="absolute top-2 right-2 p-1 h-8 w-8 rounded-full"
              variant="destructive"
              onClick={() => onRemove(index)}
              disabled={disabled}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        {values.length < maxImages && (
          <div className="aspect-square">
            <label
              htmlFor="multi-image-upload"
              className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-md cursor-pointer transition ${
                disabled
                  ? "opacity-50 cursor-not-allowed border-gray-300"
                  : "border-primary/20 hover:border-primary/50"
              }`}
            >
              <div className="flex flex-col items-center justify-center p-2 text-center">
                <Plus className="w-6 h-6 text-primary/50 mb-1" />
                <p className="text-xs text-gray-500">Add Image</p>
              </div>
              <input
                id="multi-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled}
              />
            </label>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
      
      <p className="text-xs text-gray-500">
        {values.length} of {maxImages} images ({maxSizeMB}MB max per image)
      </p>
    </div>
  );
} 