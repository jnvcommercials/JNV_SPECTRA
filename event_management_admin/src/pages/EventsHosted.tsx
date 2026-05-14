import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Filter, Plus, Loader2, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventsHostedForm } from "@/components/events/EventsHostedForm";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  useEventsHosted, 
  useCreateEventHosted, 
  useUpdateEventHosted, 
  useDeleteEventHosted,
  EventHostedFormData,
  EventHosted as ApiEventHosted
} from "@/api/events-hosted";
import { useUploadImage, useUploadMultipleImages } from "@/api/images";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

// Define EventHosted interface for UI purposes
export interface EventHosted {
  id: string;
  title: string;
  description: string;
  event_type: string;
  date: string;
  time: string;
  location: string;
  status: "completed" | "cancelled";
  feedback: string;
  rating: number;
  gallery_images?: string[];
  featured_image?: string;
}

// Map API data to UI format
const mapApiToUi = (apiEvent: ApiEventHosted): EventHosted => {
  return {
    id: apiEvent.id || "",
    title: apiEvent.event_title,
    description: apiEvent.short_description || apiEvent.detailed_description,
    event_type: apiEvent.event_type,
    date: apiEvent.event_date,
    time: apiEvent.time || "",
    location: apiEvent.location || "",
    status: apiEvent.status === "active" ? "completed" : "cancelled",
    feedback: apiEvent.feedback || "",
    rating: typeof apiEvent.rating === 'string' ? parseFloat(apiEvent.rating) : (apiEvent.rating || 0),
    gallery_images: Array.isArray(apiEvent.gallery_images) 
      ? apiEvent.gallery_images.map(img => typeof img === 'string' ? img : img.url)
      : [],
    featured_image: apiEvent.featured_image || "",
  };
};

// Mock data for development/preview purposes
const mockEventsHosted: EventHosted[] = [
  {
    id: "1",
    title: "Annual Corporate Gala 2023",
    description: "A prestigious evening celebrating company achievements and milestones.",
    event_type: "corporate",
    date: "2023-12-15",
    time: "18:00",
    location: "Grand Ballroom, Hilton Hotel",
    status: "completed",
    feedback: "Excellent event! Everyone loved the decorations and food.",
    rating: 4.8,
    featured_image: "/placeholder.svg"
  },
  {
    id: "2",
    title: "Johnson & Smith Wedding",
    description: "Elegant summer wedding with garden ceremony and indoor reception.",
    event_type: "wedding",
    date: "2023-06-22",
    time: "16:00",
    location: "Rosewood Gardens",
    status: "completed",
    feedback: "Perfect day! The arrangements exceeded our expectations.",
    rating: 5.0,
    featured_image: "/placeholder.svg"
  },
  {
    id: "3",
    title: "Product Launch Conference",
    description: "Unveiling our new product line with demonstrations and networking.",
    event_type: "corporate",
    date: "2023-05-10",
    time: "10:00",
    location: "Tech Convention Center",
    status: "completed",
    feedback: "Great organization and execution. Minor issues with the AV system.",
    rating: 4.2,
    featured_image: "/placeholder.svg"
  },
  {
    id: "4",
    title: "Charity Fundraiser Dinner",
    description: "Annual fundraising event supporting local community initiatives.",
    event_type: "social",
    date: "2023-09-05",
    time: "19:00",
    location: "Community Center",
    status: "completed",
    feedback: "Wonderful event that raised significant funds for the cause.",
    rating: 4.7,
    featured_image: "/placeholder.svg"
  }
];

export default function EventsHosted() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventHosted | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  
  // API hooks
  const eventsQuery = useEventsHosted({
    page: currentPage,
    limit: 9,
    event_type: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchQuery || undefined,
  });
  
  const createEventMutation = useCreateEventHosted();
  const updateEventMutation = useUpdateEventHosted(selectedEvent?.id || "");
  const deleteEventMutation = useDeleteEventHosted();
  const uploadImageMutation = useUploadImage();
  const uploadMultipleImagesMutation = useUploadMultipleImages();
  
  const isLoading = eventsQuery.isLoading || 
                   createEventMutation.isPending || 
                   updateEventMutation.isPending || 
                   deleteEventMutation.isPending;
  
  // For development/preview, use mock data when API is not available
  const events: EventHosted[] = 
    eventsQuery.data?.data?.data
      ? eventsQuery.data.data.data.map(mapApiToUi)
      : mockEventsHosted;
      
  const totalPages = eventsQuery.data?.data?.pagination?.totalPages || Math.ceil(mockEventsHosted.length / 9);
  
  // Get all unique event types from events
  const eventTypes = ["all", ...Array.from(new Set(events.map(event => event.event_type)))];
  
  // Get all unique status types
  const statusTypes = ["all", "completed", "cancelled"];

  const handleEdit = (event: EventHosted) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setEventToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      await deleteEventMutation.mutateAsync(eventToDelete);
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleFormSubmit = async (data: EventHostedFormData, galleryImages: File[]) => {
    try {
      // First create/update the event
      let eventId = selectedEvent?.id;
      
      if (selectedEvent) {
        await updateEventMutation.mutateAsync(data);
      } else {
        const response = await createEventMutation.mutateAsync(data);
        eventId = response?.data?.id;
      }
      
      // If we have an event ID and images to upload, handle them
      if (eventId) {
        console.log("Event ID for image uploads:", eventId);
        
        // Upload featured image if there is one
        if (data.featured_image && data.featured_image.startsWith('blob:')) {
          console.log("Uploading featured image");
          try {
            const featuredImageFile = await fetch(data.featured_image)
              .then(r => r.blob())
              .then(blob => new File([blob], "featured-image.jpg", { type: "image/jpeg" }));
            
            const featuredImageUrl = await uploadImageMutation.mutateAsync(featuredImageFile);
            console.log("Featured image uploaded:", featuredImageUrl);
            
            // Update the event with the new featured image URL
            await updateEventMutation.mutateAsync({
              ...data,
              featured_image: featuredImageUrl
            });
          } catch (error) {
            console.error("Error uploading featured image:", error);
            toast({
              title: "Warning",
              description: "Event saved but featured image upload failed. Try again later.",
              variant: "destructive",
            });
          }
        }
        
        // Upload gallery images if there are any
        if (galleryImages.length > 0) {
          console.log(`Uploading ${galleryImages.length} gallery images`);
          try {
            const galleryImageUrls = await uploadMultipleImagesMutation.mutateAsync(galleryImages);
            console.log("Gallery images uploaded:", galleryImageUrls);
            
            // Update the event with the new gallery image URLs
            await updateEventMutation.mutateAsync({
              ...data,
              gallery_images: galleryImageUrls
            });
          } catch (error) {
            console.error("Error uploading gallery images:", error);
            toast({
              title: "Warning",
              description: "Event saved but gallery images upload failed. Try again later.",
              variant: "destructive",
            });
          }
        }
        
        // Refresh the events list to show the updated images
        eventsQuery.refetch();
      }
      
      setSelectedEvent(null);
      setShowForm(false);
      
      toast({
        title: "Success",
        description: eventId ? "Event updated successfully" : "Event created successfully",
      });
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save event",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Events Hosted</h1>
            <p className="text-muted-foreground">Manage your hosted events</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setShowForm(true)} disabled={createEventMutation.isPending}>
              {createEventMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  New Event
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border/40" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-sm text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                `${events.length} ${events.length === 1 ? 'Event' : 'Events'} Hosted`
              )}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {events.map((event) => (
                <EventHostedCardItem 
                  key={event.id} 
                  event={event} 
                  onEdit={() => handleEdit(event)} 
                  onDelete={() => handleDelete(event.id)} 
                />
              ))}
            </div>
            
            {events.length === 0 && (
              <EmptyState
                icon={Calendar}
                title="No hosted events found"
                description="Try adjusting your search or filters, or add a new hosted event."
              >
                <Button onClick={() => {
                  setSelectedEvent(null);
                  setShowForm(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Hosted Event
                </Button>
              </EmptyState>
            )}
            
            {events.length > 0 && totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hosted event record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteEventMutation.isPending}>
              {deleteEventMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Event Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
          <EventsHostedForm
            initialData={selectedEvent}
            onSubmit={handleFormSubmit}
            isLoading={createEventMutation.isPending || updateEventMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

interface EventHostedCardProps {
  event: EventHosted;
  onEdit: () => void;
  onDelete: () => void;
}

function EventHostedCardItem({ event, onEdit, onDelete }: EventHostedCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 overflow-hidden relative">
        {event.featured_image ? (
          <img
            src={event.featured_image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">No image</p>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={event.status === "completed" ? "default" : "destructive"}>
            {event.status === "completed" ? "Completed" : "Cancelled"}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold line-clamp-1">{event.title}</h2>
            <p className="text-sm text-gray-500">
              {new Date(event.date).toLocaleDateString()} at {event.time}
            </p>
          </div>
          <Badge variant="outline">{event.event_type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm line-clamp-2">{event.description}</p>
        <div className="mt-2 flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="text-sm">
            {typeof event.rating === 'number' ? event.rating.toFixed(1) : '0.0'}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}