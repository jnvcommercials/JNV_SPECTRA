import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RentalCard } from "@/components/rentals/RentalCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RentalForm } from "@/components/rentals/RentalForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Loader2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useRentals, useCreateRental, useUpdateRental, useDeleteRental } from "@/api/rentals";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Define Rental interface
export interface BulletPoint {
  label: string;
  value: string;
}

export interface Rental {
  id: string;
  title: string;
  description: string;
  featured_image?: string;
  gallery_images?: string[];
  bullet_points: Array<{
    key: string;
    value: string;
  }>;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export default function Rentals() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const itemsPerPage = 6;

  // API hooks
  const { data: rentalsData, isLoading, error: apiError, refetch } = useRentals({
    page: currentPage,
    limit: itemsPerPage
  });
  
  const createRentalMutation = useCreateRental();
  const updateRentalMutation = useUpdateRental(selectedRental || "");
  const deleteRentalMutation = useDeleteRental();

  const rentals: Rental[] = rentalsData?.data || [];
  const totalPages = rentalsData?.pagination?.totalPages || 1;
  const error = apiError ? "Failed to load rentals. Please try again." : null;

  const handleRetry = () => {
    refetch();
  };

  const handleEdit = (id: string) => {
    setSelectedRental(id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setSelectedRental(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRental) {
      deleteRentalMutation.mutate(selectedRental, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedRental(null);
        }
      });
    }
  };

  const handleFormSubmit = async (values: any, featuredImage: File | null, additionalImages: File[]) => {
    try {
      setIsUploading(true);
      console.log("Form submission started with values:", values);

      // Determine if creating new or updating existing rental
      const isNewRental = !selectedRental;
      let rentalId = selectedRental;
      
      if (isNewRental) {
        // Create new rental without images first
        console.log("Creating new rental...");
        const response = await createRentalMutation.mutateAsync(values);
        console.log("New rental created:", response);
        
        if (!response?.data?.id) {
          throw new Error("Failed to create rental: No ID returned");
        }
        
        rentalId = response.data.id;
        setSelectedRental(rentalId);
        
        toast({
          title: "Success",
          description: "Rental created successfully",
        });
      } else {
        // Update existing rental
        console.log("Updating existing rental...");
        await updateRentalMutation.mutateAsync(values);
        console.log("Rental updated successfully");
        
        toast({
          title: "Success",
          description: "Rental updated successfully",
        });
      }

      // Close the form dialog and reset selection
      setIsFormOpen(false);
      setSelectedRental(null);
      
    } catch (err) {
      console.error("Error submitting form:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save rental",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const selectedRentalData = selectedRental
    ? rentals.find(rental => rental.id === selectedRental)
    : undefined;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Rentals</h1>
            <p className="text-muted-foreground">Manage your rental items and equipment</p>
          </div>
          <Button 
            onClick={() => {
              setSelectedRental(null);
              setIsFormOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Rental
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border/40" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-sm text-muted-foreground">
              {rentals.length} {rentals.length === 1 ? 'Rental' : 'Rentals'} Available
            </span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <Button variant="link" onClick={handleRetry} className="p-0 h-auto font-normal">
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-32 w-full" />
                <div className="flex justify-end space-x-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : rentals.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Package className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium">No rentals found</h3>
            <p className="text-muted-foreground">Get started by creating a new rental item.</p>
            <Button 
              onClick={() => {
                setSelectedRental(null);
                setIsFormOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Rental
            </Button>
          </div>
        ) : (
          <>
            {isUploading && (
              <div className="mb-4 p-3 border border-primary/30 rounded-md bg-primary/10 text-primary flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Uploading images...</span>
              </div>
            )}
            
            {createRentalMutation.isPending || updateRentalMutation.isPending || deleteRentalMutation.isPending ? (
              <div className="mb-4 p-3 border border-primary/30 rounded-md bg-primary/10 text-primary flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Processing request...</span>
              </div>
            ) : null}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rentals.filter(rental => rental && rental.id).map((rental) => (
                <RentalCard 
                  key={rental.id} 
                  rental={rental} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
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
                      className={cn(
                        currentPage === 1 ? "pointer-events-none opacity-50" : "",
                        "hover:bg-primary/10"
                      )}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className={cn(
                          "hover:bg-primary/10",
                          currentPage === i + 1 && "bg-primary text-primary-foreground"
                        )}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      aria-disabled={currentPage === totalPages}
                      className={cn(
                        currentPage === totalPages ? "pointer-events-none opacity-50" : "",
                        "hover:bg-primary/10"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {selectedRentalData ? "Edit Rental" : "Create New Rental"}
              </DialogTitle>
            </DialogHeader>
            <RentalForm
              initialData={selectedRentalData}
              onSubmit={handleFormSubmit}
              isLoading={createRentalMutation.isPending || updateRentalMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the rental
                and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
