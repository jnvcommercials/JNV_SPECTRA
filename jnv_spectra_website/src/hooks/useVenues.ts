import { useQuery } from "@tanstack/react-query";
import { getAllVenues, getVenueById, VenueItem } from "@/api/venues";

export const useVenues = () => {
  return useQuery<VenueItem[] | null>({
    queryKey: ["venues"],
    queryFn: getAllVenues,
  });
};


export const useVenueById = (id: string) => {
  return useQuery<VenueItem | null>({
    queryKey: ["venue", id],
    queryFn: () => getVenueById(id),
    enabled: !!id, // Only run if ID is provided
  });
};
