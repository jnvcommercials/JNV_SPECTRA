
// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import Layout from "@/components/layout/Layout";
// import RentalFilters from "@/components/rentals/RentalFilters";
// import RentalGrid from "@/components/rentals/RentalGrid";
// import { FilterOptions } from "@/types";
// import { rentalService } from "@/api";
// import { mockRentals } from "@/mocks/data";

// const RentalsPage = () => {
//   const [filters, setFilters] = useState<FilterOptions>({});
  
//   // In a real app, we would fetch from the API with filters
//   // Using mock data for now
//   const { data, isLoading } = useQuery({
//     queryKey: ["rentals", filters],
//     queryFn: () => ({ data: mockRentals }),
//     initialData: { data: mockRentals }
//   });
  
//   // Filter rental items based on the selected filters
//   const filteredRentals = data?.data.filter(item => {
//     // Category filter
//     if (filters.category && item.category !== filters.category) {
//       return false;
//     }
    
//     // Price range filter
//     if (filters.priceMin !== undefined && item.price < filters.priceMin) {
//       return false;
//     }
//     if (filters.priceMax !== undefined && item.price > filters.priceMax) {
//       return false;
//     }
    
//     // Search query filter
//     if (filters.searchQuery) {
//       const query = filters.searchQuery.toLowerCase();
//       const nameMatch = item.name.toLowerCase().includes(query);
//       const descMatch = item.description.toLowerCase().includes(query);
//       const tagMatch = item.tags.some(tag => tag.toLowerCase().includes(query));
      
//       if (!nameMatch && !descMatch && !tagMatch) {
//         return false;
//       }
//     }
    
//     return true;
//   });
  
//   const handleFilterChange = (newFilters: FilterOptions) => {
//     setFilters(newFilters);
//   };
  
//   return (
//     <Layout>
//       {/* Hero Section */}
//       <section className="bg-party-purple text-white py-16">
//         <div className="container text-center">
//           <h1 className="text-4xl font-bold mb-4">Party Rentals</h1>
//           <p className="text-xl max-w-3xl mx-auto">
//             Browse our extensive collection of high-quality rental items for your next event.
//             From tents and tables to decor and entertainment equipment, we have everything you need.
//           </p>
//         </div>
//       </section>
      
//       {/* Rentals Content */}
//       <section className="py-12">
//         <div className="container">
//           {/* Filters */}
//           <RentalFilters onFilterChange={handleFilterChange} currentFilters={filters} />
          
//           {/* Results Stats */}
//           <div className="mb-6">
//             <p className="text-muted-foreground">
//               Showing {filteredRentals?.length || 0} of {data?.data.length || 0} items
//             </p>
//           </div>
          
//           {/* Rental Grid */}
//           <RentalGrid rentals={filteredRentals || []} isLoading={isLoading} />
//         </div>
//       </section>
//     </Layout>
//   );
// };

// export default RentalsPage;
