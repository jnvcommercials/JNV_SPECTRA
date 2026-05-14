import { useQuery } from "@tanstack/react-query";
import { getAllRentals, RentalItem } from "@/api/rentals";

export const useRentals = () => {
  return useQuery<RentalItem[] | null>({
    queryKey: ["rentals"],
    queryFn: getAllRentals,
  });
};
