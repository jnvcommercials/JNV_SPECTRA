import { GalleryItem, getAllGalleryItems } from "@/api/gallery";
import { useQuery } from "@tanstack/react-query";
// import { getAllRentals, RentalItem } from "@/api/rentals";

export const useGallery = () => {
  return useQuery<GalleryItem[] | null>({
    queryKey: ["gallery"],
    queryFn: getAllGalleryItems,
  });
};
