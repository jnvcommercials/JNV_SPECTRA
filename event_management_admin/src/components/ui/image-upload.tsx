import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
  maxSizeMB?: number;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  maxSizeMB = 2,
}: ImageUploadProps) {
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
    
    setError(null);
    onChange(file);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {value ? (
        <div className="relative w-full h-64 rounded-md overflow-hidden border">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <Button
            className="absolute top-2 right-2 p-1 h-8 w-8 rounded-full"
            variant="destructive"
            onClick={onRemove}
            disabled={disabled}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="w-full">
          <label
            htmlFor="image-upload"
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-md cursor-pointer transition ${
              disabled
                ? "opacity-50 cursor-not-allowed border-gray-300"
                : "border-primary/20 hover:border-primary/50"
            }`}
          >
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Upload className="w-10 h-10 text-primary/50 mb-2" />
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Max file size: {maxSizeMB}MB
              </p>
              {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </div>
            <input
              id="image-upload"
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
  );
} 