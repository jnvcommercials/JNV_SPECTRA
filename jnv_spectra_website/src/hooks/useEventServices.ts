import { EventServiceItem, getAllEventServices, getEventServiceById } from "@/api/eventService";
import { useQuery } from "@tanstack/react-query";

export const useEventServices = () => {
  return useQuery<EventServiceItem[] | null>({
    queryKey: ["services"],
    queryFn: getAllEventServices,
  });
};


export const useEventServiceById = (id: string) => {
  return useQuery<EventServiceItem | null>({
    queryKey: ["service", id],
    queryFn: () => getEventServiceById(id),
    enabled: !!id, // Only run if ID is provided
  });
};
