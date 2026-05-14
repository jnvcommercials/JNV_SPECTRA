import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ServiceForm } from "@/components/services/ServiceForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Filter, Plus, Loader2, Package, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useServices, useCreateService, useUpdateService, useDeleteService, Service, ServiceFormValues } from "@/api/services";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { retry } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Loading skeleton for service cards
const ServiceCardSkeleton = () => (
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

export default function Services() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const itemsPerPage = 6;

  // API hooks with retry logic
  const { data: servicesData, isLoading, error: apiError, refetch } = useServices({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery
  });
  
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService(selectedService || "");
  const deleteServiceMutation = useDeleteService();

  const services = servicesData?.data || [];
  const totalPages = servicesData?.meta?.totalPages || 1;
  const error = apiError ? "Failed to load services. Please try again." : null;

  // Handle retry on error
  const handleRetry = () => {
    refetch();
  };

  const handleEdit = (id: string) => {
    setSelectedService(id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setSelectedService(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedService) {
      deleteServiceMutation.mutate(selectedService);
      setIsDeleteOpen(false);
      setSelectedService(null);
    }
  };

  const handleCreateService = async (values: ServiceFormValues) => {
    try {
      console.log('Creating service with values:', values);
      await createServiceMutation.mutateAsync(values);
      toast({
        title: "Success",
        description: "Service created successfully",
      });
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateService = async (values: ServiceFormValues) => {
    if (!selectedService) {
      console.error('No service selected for update');
      return;
    }
    
    try {
      console.log('Updating service with values:', values);
      await updateServiceMutation.mutateAsync(values);
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update service. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedServiceData = selectedService
    ? services.find(service => service.id === selectedService)
    : undefined;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground">Manage your event services and offerings</p>
          </div>
          <Button 
            onClick={() => {
              setSelectedService(null);
              setIsFormOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Service
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border/40" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-sm text-muted-foreground">
              {services.length} {services.length === 1 ? 'Service' : 'Services'} Available
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
              <ServiceCardSkeleton key={index} />
            ))}
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No services found"
            description="Get started by creating a new service."
          >
            <Button 
              onClick={() => {
                setSelectedService(null);
                setIsFormOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Service
            </Button>
          </EmptyState>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
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
                {selectedServiceData ? "Edit Service" : "Create New Service"}
              </DialogTitle>
            </DialogHeader>
            <ServiceForm
              initialData={selectedServiceData}
              onSubmit={selectedServiceData ? handleUpdateService : handleCreateService}
              isLoading={createServiceMutation.isPending || updateServiceMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the service
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
