import { Calendar, DollarSign, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Event } from "@/api/events";
import { useState, useMemo, memo } from "react";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    status: string;
    featured_image?: string;
    bullet_points?: Array<{ label: string; value: string }>;
    onEdit?: () => void;
    onDelete?: () => void;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

// Memoize the status badge component
const StatusBadge = memo(({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisplayStatus = (status: string) => {
    return status === 'active' ? 'Active' : 'Inactive';
  };

  return (
    <div className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(status)}`}>
      {getDisplayStatus(status)}
    </div>
  );
});

StatusBadge.displayName = 'StatusBadge';

// Memoize the image component
const EventImage = memo(({ 
  src, 
  alt, 
  onLoad, 
  onError 
}: { 
  src: string; 
  alt: string; 
  onLoad: () => void; 
  onError: () => void;
}) => {
  return (
    <img
      src={src || '/placeholder.svg'}
      alt={alt}
      className="h-full w-full object-cover transition-opacity"
      onLoad={onLoad}
      onError={onError}
    />
  );
});

EventImage.displayName = 'EventImage';

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Memoize the event title
  const title = useMemo(() => 
    event.title || "Untitled Event",
    [event.title]
  );

  // Memoize the event description
  const description = useMemo(() => 
    event.description || "No description available",
    [event.description]
  );

  // Memoize the bullet points
  const bulletPoints = useMemo(() => 
    event.bullet_points || [],
    [event.bullet_points]
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="relative aspect-video">
        {event.featured_image ? (
          <img
            src={event.featured_image}
            alt={event.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold">{event.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{event.description}</p>
        </div>
        
        {event.bullet_points && event.bullet_points.length > 0 && (
          <div className="space-y-2">
            {event.bullet_points.map((point, index) => (
              <div key={index} className="flex items-start">
                <span className="text-sm text-gray-500">{point.label}:</span>
                <span className="text-sm ml-2">{point.value}</span>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className={`text-sm px-2 py-1 rounded-full ${
            event.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {event.status}
          </span>
          
          <div className="flex space-x-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

EventCard.displayName = 'EventCard';