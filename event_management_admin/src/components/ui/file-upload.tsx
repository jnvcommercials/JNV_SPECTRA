
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  onChange?: (files: File[]) => void;
  value?: string[];
  className?: string;
  maxFiles?: number;
  maxSize?: number; // In MB
}

export function FileUpload({
  accept = "image/*",
  multiple = false,
  onChange,
  value = [],
  className,
  maxFiles = 5,
  maxSize = 5, // Default 5MB
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(value || []);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const fileList = e.target.files;
    
    if (!fileList) return;
    
    if (!multiple && fileList.length > 1) {
      setError("Only one file can be uploaded");
      return;
    }
    
    if (multiple && fileList.length > maxFiles) {
      setError(`Maximum ${maxFiles} files can be uploaded`);
      return;
    }
    
    const selectedFiles: File[] = [];
    const newPreviews: string[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Check file size (convert maxSize from MB to bytes)
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File ${file.name} exceeds the maximum size of ${maxSize}MB`);
        continue;
      }
      
      selectedFiles.push(file);
      
      // Create preview for image files
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          setPreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push("file");
      }
    }
    
    setFiles((prev) => [...prev, ...selectedFiles]);
    
    if (onChange) {
      onChange(selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    
    if (onChange) {
      const updatedFiles = files.filter((_, i) => i !== index);
      onChange(updatedFiles);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div 
        className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
        onClick={handleClick}
      >
        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground text-center">
          <span className="font-medium text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {multiple ? `Up to ${maxFiles} files` : "Single file"} (max {maxSize}MB)
        </p>
        <input
          type="file"
          ref={inputRef}
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              {preview.startsWith("data:image") ? (
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  className="h-24 w-full object-cover rounded-md"
                />
              ) : (
                <div className="h-24 w-full bg-muted flex items-center justify-center rounded-md">
                  <span className="text-xs text-muted-foreground">File</span>
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
