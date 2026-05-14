import React from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  ...props
}) => {
  // Convert image path to WebP format
  const getWebPSrc = (originalSrc: string) => {
    const lastDotIndex = originalSrc.lastIndexOf('.');
    if (lastDotIndex === -1) return originalSrc;
    return originalSrc.slice(0, lastDotIndex) + '.webp';
  };

  return (
    <picture>
      {/* WebP source */}
      <source
        srcSet={getWebPSrc(src)}
        type="image/webp"
      />
      {/* Fallback image */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        width={width}
        height={height}
        className={cn('object-cover', className)}
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage; 