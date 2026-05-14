import { useState, useMemo, useCallback, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Filter, Plus, Loader2, Calendar, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventForm } from "@/components/events/EventForm";
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, Event } from "@/api/events";
import { EventCard } from "@/components/events/EventCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

// Loading skeleton for event cards
const EventCardSkeleton = () => (
  <div className="rounded-lg border p-4 space-y-4">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-32 w-full" />
    <div className="flex justify-end space-x-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

const defaultValues = {
  title: '',
  description: '',
  pricing: '0.00',
  featured_image: '',
  additional_images: [],
  bullet_points: [],
  status: 'active'
};

export default function Events() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Debounce search query to prevent rapid API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Use API hooks with stable parameters
  const { 
    data: eventsData, 
    isLoading, 
    error: apiError,
    refetch
  } = useEvents({
    page: currentPage,
    limit: itemsPerPage,
    event_type: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: debouncedSearchQuery || undefined
  });

  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent(selectedEvent || "");
  const deleteEventMutation = useDeleteEvent();

  // Memoize events data to prevent unnecessary recalculations
  const { events, totalPages } = useMemo(() => {
    const events = eventsData?.data || [];
    const totalPages = eventsData?.pagination?.totalPages || 1;
    return { events, totalPages };
  }, [eventsData]);

  // Memoize mapped events with stable references
  const mappedEvents = useMemo(() => {
    return events.map((event: Event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      pricing: event.pricing,
      featured_image: event.featured_image,
      additional_images: event.additional_images,
      bullet_points: event.bullet_points,
      status: event.status
    }));
  }, [events]);

  // Memoize event types with stable references
  const eventTypes = useMemo(() => {
    return ["all", "active", "inactive"];
  }, []);

  // Stable status types array
  const statusTypes = ["all", "active", "inactive"];

  // Handle retry on error
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleEdit = useCallback((id: string) => {
    console.log("Edit clicked for event:", id);
    setSelectedEvent(id);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    console.log("Delete clicked for event:", id);
    setSelectedEvent(id);
    setIsDeleteOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (selectedEvent) {
      try {
        await deleteEventMutation.mutateAsync(selectedEvent);
        setIsDeleteOpen(false);
        setSelectedEvent(null);
        toast({
          title: "Event deleted",
          description: "The event has been successfully deleted.",
        });
      } catch (error) {
        // Error is handled by the mutation itself
      }
    }
  }, [selectedEvent, deleteEventMutation, toast]);

  const handleFormSubmit = useCallback(async (values: any) => {
    try {
      console.log('[Events] Form submission started:', {
        isEdit: !!selectedEvent,
        values,
        selectedEvent
      });

      if (selectedEvent) {
        // Update existing event
        console.log('[Events] Updating event with data:', values);
        await updateEventMutation.mutateAsync(values);
        toast({
          title: "Success",
          description: "Event updated successfully",
        });
      } else {
        // Create new event
        console.log('[Events] Creating new event with data:', values);
        await createEventMutation.mutateAsync(values);
        toast({
          title: "Success",
          description: "Event created successfully",
        });
      }
      
      setIsFormOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('[Events] Form submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit event",
        variant: "destructive",
      });
    }
  }, [selectedEvent, updateEventMutation, createEventMutation, toast]);

  // Update only the selectedEventData useMemo
  const selectedEventData = useMemo(() => {
    if (!selectedEvent) return null;
    const event = events.find(event => event.id === selectedEvent);
    if (!event) return null;
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      pricing: event.pricing,
      featured_image: event.featured_image,
      additional_images: event.additional_images,
      bullet_points: event.bullet_points,
      status: event.status
    };
  }, [selectedEvent, events]);

  // Add a useEffect to log when the form opens
  useEffect(() => {
    if (isFormOpen) {
      console.log("Form opened with selectedEvent:", selectedEvent);
      console.log("Selected event data:", selectedEventData);
    }
  }, [isFormOpen, selectedEvent, selectedEventData]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">Manage your events and activities</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setIsFormOpen(true)} disabled={createEventMutation.isPending}>
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
                `${mappedEvents.length} ${mappedEvents.length === 1 ? 'Event' : 'Events'} Available`
              )}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        ) : mappedEvents.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No events found"
            description="Get started by creating a new event."
            children={
              <Button onClick={() => {
                setSelectedEvent(null);
                setIsFormOpen(true);
              }}>
                {createEventMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    New Event
                  </>
                )}
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mappedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={() => handleEdit(event.id)}
                  onDelete={() => handleDelete(event.id)}
                  isEditing={updateEventMutation.isPending && selectedEvent === event.id}
                  isDeleting={deleteEventMutation.isPending && selectedEvent === event.id}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      aria-disabled={currentPage === 1}
                      className={cn(currentPage === 1 ? "pointer-events-none opacity-50" : "")}
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
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      aria-disabled={currentPage === totalPages}
                      className={cn(currentPage === totalPages ? "pointer-events-none opacity-50" : "")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}

        {apiError && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center">
              {apiError.message}
              <Button variant="link" onClick={handleRetry} className="ml-2 p-0 h-auto font-normal" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="ml-1 mr-1 h-3 w-3 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  "Try again"
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {events.length} of {totalPages * itemsPerPage} events
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => {
        console.log("Dialog open state changed:", open);
        console.log("Selected event data when opening:", selectedEventData);
        setIsFormOpen(open);
        if (!open) setSelectedEvent(null);
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <EventForm
            initialData={selectedEventData}
            onSubmit={handleFormSubmit}
            isLoading={createEventMutation.isPending || updateEventMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              and remove all associated data.
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
    </DashboardLayout>
  );
}