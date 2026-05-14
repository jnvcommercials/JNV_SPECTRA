import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VenueCard } from "@/components/venues/VenueCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VenueForm } from "@/components/venues/VenueForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Filter, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVenues, useCreateVenue, useUpdateVenue, useDeleteVenue } from "@/api/venues";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Define Venue interface
export interface BulletPoint {
  label: string;
  value: string;
}

export interface Venue {
  id: string;
  title: string;
  description: string;
  location: string;
  capacity: "50" | "100-200" | "200-500" | "500-1000" | "1000+";
  venue_type: "banquet halls" | "Garden and Outdoor venues" | "Resorts" | "Roof top" | "Beach front venues";
  space_preference: "indoor" | "outdoor" | "both";
  rating: number;
  featured_image: string;
  additional_images?: string[];
  bullet_points?: BulletPoint[];
  status: "active" | "draft" | "archived";
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export default function Venues() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const itemsPerPage = 6; // 2 rows of 3 cards

  // API hooks
  const { data: venuesData, isLoading, error: apiError } = useVenues();
  
  const createVenueMutation = useCreateVenue();
  const updateVenueMutation = useUpdateVenue(selectedVenue || "");
  const deleteVenueMutation = useDeleteVenue();

  // Display detailed error information
  console.log('API Error:', apiError);
  
  // Extract venues from the response data
  const venues: Venue[] = venuesData?.data || [];
  const totalPages = Math.ceil((venues?.length || 0) / itemsPerPage);
  
  // Detailed error message for debugging
  const error = apiError 
    ? `Failed to load venues: ${apiError.message || JSON.stringify(apiError)}` 
    : null;

  const handleEdit = (id: string) => {
    setSelectedVenue(id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setSelectedVenue(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedVenue) {
      deleteVenueMutation.mutate(selectedVenue, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedVenue(null);
        }
      });
    }
  };

  const handleFormSubmit = async (values: any, featuredImage: File | null, additionalImages: File[]) => {
    try {
      // Determine if creating new or updating existing venue
      const isNewVenue = !selectedVenue;
      
      if (isNewVenue) {
        // Create new venue without images first
        const response = await createVenueMutation.mutateAsync(values);
        toast({
          title: "Success",
          description: "Venue created successfully. You can now upload images.",
        });
        
        // Set the selected venue to the new one so images can be uploaded
        setSelectedVenue(response.id);
        
        // Keep form open for image upload
        return;
      } else {
        // Update existing venue
        await updateVenueMutation.mutateAsync(values);
        toast({
          title: "Success",
          description: "Venue updated successfully",
        });
        
        // Close the form dialog
        setIsFormOpen(false);
        setSelectedVenue(null);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      // Toast error is handled by the API hooks
    }
  };

  const selectedVenueData = selectedVenue
    ? venues.find(venue => venue.id === selectedVenue)
    : undefined;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
            <p className="text-muted-foreground">Manage your event venues and spaces</p>
          </div>
          <Button onClick={() => {
            setSelectedVenue(null);
            setIsFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Venue
          </Button>
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
                `${venues.length} ${venues.length === 1 ? 'Venue' : 'Venues'} Available`
              )}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[200px] w-full rounded-t-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {isUploading && (
              <div className="p-3 border border-primary/30 rounded-md bg-primary/10 text-primary flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Uploading images...</span>
              </div>
            )}
            
            {createVenueMutation.isPending || updateVenueMutation.isPending || deleteVenueMutation.isPending ? (
              <div className="p-3 border border-primary/30 rounded-md bg-primary/10 text-primary flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Processing request...</span>
              </div>
            ) : null}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.filter(venue => venue && venue.id).map((venue) => (
                <VenueCard 
                  key={venue.id} 
                  venue={venue} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
              ))}
            </div>
            
            {venues.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-semibold">No venues found</h3>
                  <p className="text-muted-foreground">
                    Get started by adding a new venue
                  </p>
                </div>
                <Button 
                  className="mt-4"
                  onClick={() => {
                    setSelectedVenue(null);
                    setIsFormOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Venue
                </Button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        aria-disabled={currentPage === 1}
                        className={cn(
                          currentPage === 1 && "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        aria-disabled={currentPage === totalPages}
                        className={cn(
                          currentPage === totalPages && "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVenue ? "Edit Venue" : "Create New Venue"}</DialogTitle>
          </DialogHeader>
          <VenueForm
            initialData={selectedVenueData}
            onSubmit={handleFormSubmit}
            isLoading={createVenueMutation.isPending || updateVenueMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the venue
              and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
} 