import { useQuery } from "@tanstack/react-query";
import { getAllEvents, EventItem, getEventById } from "@/api/events";

export const useEvents = () => {
  return useQuery<EventItem[] | null>({
    queryKey: ["events"],
    queryFn: getAllEvents,
  });
};

export const useEventById = (id: string) => {
  return useQuery<EventItem | null>({
    queryKey: ["event", id],
    queryFn: () => getEventById(id),
    enabled: !!id, // Only run if ID is provided
  });
};
