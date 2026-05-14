import React, { useState, useRef } from "react";
import { 
  Upload, X, Image as ImageIcon, Camera, Loader2,
  FileImage, CircleAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnhancedImageUploadProps {
  label: string;
  description?: string;
  currentImage?: string | null;
  previewUrls?: string[];
  onChange: (files: File[]) => void;
  onUpload?: () => Promise<void>;
  onRemove?: (index: number) => void;
  isUploading?: boolean;
  disabled?: boolean;
  disabledMessage?: string;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  variant?: "featured" | "gallery";
}

export function EnhancedImageUpload({
  label,
  description,
  currentImage,
  previewUrls = [],
  onChange,
  onUpload,
  onRemove,
  isUploading = false,
  disabled = false,
  disabledMessage,
  multiple = false,
  maxFiles = 5,
  className,
  variant = "featured"
}: EnhancedImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      const validFiles = fileArray.slice(0, maxFiles);
      onChange(validFiles);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files);
      const validFiles = fileArray.slice(0, maxFiles);
      onChange(validFiles);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  // Featured image style - single, large image
  if (variant === "featured") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex flex-col space-y-1.5">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">{label}</div>
            {previewUrls.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {previewUrls.length} selected
              </span>
            )}
          </div>
          
          {disabled && disabledMessage && (
            <Alert variant="destructive" className="py-2">
              <CircleAlert className="h-4 w-4" />
              <AlertDescription>{disabledMessage}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Image preview area */}
          <div 
            className={cn(
              "relative w-full md:w-1/3 h-48 md:h-64 flex-none rounded-md overflow-hidden",
              currentImage || previewUrls.length > 0 
                ? "border border-border" 
                : "border-2 border-dashed border-muted-foreground/25",
              dragActive && "border-primary border-2 bg-primary/5",
              disabled && "opacity-60"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={disabled ? undefined : handleDrop}
          >
            {currentImage || previewUrls.length > 0 ? (
              <>
                <img 
                  src={previewUrls[0] || currentImage || ''} 
                  alt={label} 
                  className="h-full w-full object-cover"
                />
                {!disabled && onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(0)}
                    className="absolute top-2 right-2 bg-black/70 rounded-full p-1.5 text-white hover:bg-black/90"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <FileImage className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  {disabled ? "Images unavailable" : "No image selected"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  {disabled 
                    ? "Save first to upload" 
                    : "Drag & drop or click to upload"
                  }
                </p>
              </div>
            )}
            
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-7 w-7 text-primary animate-spin mb-2" />
                  <p className="text-sm font-medium">Uploading...</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Upload controls */}
          <div className="flex-1 flex flex-col justify-center space-y-3">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
              disabled={disabled || isUploading}
              multiple={multiple}
            />
            
            <Button 
              type="button" 
              variant="outline" 
              className={cn(
                "w-full flex items-center justify-center",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled || isUploading}
              onClick={handleClick}
            >
              <Upload className="mr-2 h-4 w-4" />
              {currentImage || previewUrls.length > 0 
                ? "Change Image" 
                : "Select Image"
              }
            </Button>
            
            {onUpload && (previewUrls.length > 0 || currentImage) && (
              <Button 
                type="button" 
                className="w-full"
                disabled={disabled || isUploading || previewUrls.length === 0}
                onClick={onUpload}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Upload to Server
                  </>
                )}
              </Button>
            )}
            
            <div className="text-xs text-muted-foreground mt-1">
              {description || "Recommended size: 1200 x 800px (3:2 ratio). Max 5MB."}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Gallery style - multiple image grid
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col space-y-1.5">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">{label}</div>
          {previewUrls.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {previewUrls.length} image{previewUrls.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        
        {disabled && disabledMessage && (
          <Alert variant="destructive" className="py-2">
            <CircleAlert className="h-4 w-4" />
            <AlertDescription>{disabledMessage}</AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* Gallery preview area */}
      <div 
        className={cn(
          "w-full border rounded-md overflow-hidden",
          dragActive && "border-primary border-2 bg-primary/5",
          disabled && "opacity-60"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={disabled ? undefined : handleDrop}
      >
        {previewUrls.length > 0 ? (
          <ScrollArea className="h-[280px] p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {previewUrls.map((url, index) => (
                <div 
                  key={`image-${index}`}
                  className="relative aspect-square rounded-md overflow-hidden border border-border group"
                >
                  <img 
                    src={url} 
                    alt={`Image ${index + 1}`} 
                    className="h-full w-full object-cover"
                  />
                  {!disabled && onRemove && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="bg-black/70 rounded-full p-1.5 text-white hover:bg-black/90"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Add more images button */}
              {!disabled && previewUrls.length < maxFiles && (
                <button 
                  type="button"
                  onClick={handleClick}
                  disabled={isUploading}
                  className="aspect-square rounded-md border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Add More</span>
                </button>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div 
            className="h-[200px] flex flex-col items-center justify-center p-4 cursor-pointer"
            onClick={disabled ? undefined : handleClick}
          >
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              {disabled ? "Gallery unavailable" : "No images selected"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[250px] text-center">
              {disabled 
                ? "Save first to upload gallery images" 
                : `Drag & drop or click to upload up to ${maxFiles} images`
              }
            </p>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          disabled={disabled || isUploading}
          multiple={multiple}
        />
        
        {previewUrls.length > 0 ? (
          <div className="flex-1 flex items-center space-x-3">
            <Button 
              type="button" 
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={disabled || isUploading}
              onClick={handleClick}
            >
              <Upload className="mr-2 h-4 w-4" />
              Add More Images
            </Button>
            
            {onUpload && (
              <Button 
                type="button" 
                size="sm"
                className="flex-1"
                disabled={disabled || isUploading}
                onClick={onUpload}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Upload to Server
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <Button 
            type="button" 
            variant="outline"
            className="w-full"
            disabled={disabled || isUploading}
            onClick={handleClick}
          >
            <Upload className="mr-2 h-4 w-4" />
            Select Images
          </Button>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground">
        {description || `Upload up to ${maxFiles} images (max 5MB each)`}
      </div>
    </div>
  );
} 