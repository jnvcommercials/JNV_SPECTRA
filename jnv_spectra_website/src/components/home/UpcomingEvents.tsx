
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { eventService } from "@/api";
import { mockEvents } from "@/mocks/data";

const UpcomingEvents = () => {
  // In a real app, we would fetch from the API
  // Using mock data for now since API is not available
  const { data, isLoading } = useQuery({
    queryKey: ["upcomingEvents"],
    queryFn: () => ({ data: mockEvents.filter(e => e.status === "upcoming") }),
    initialData: { data: mockEvents.filter(e => e.status === "upcoming") }
  });

  const upcomingEvents = data?.data || [];

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Loading Upcoming Events...</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Upcoming Events</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join us at these exciting upcoming events. Perfect opportunities to experience our services firsthand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="party-card group hover:translate-y-[-5px]">
              <div className="relative h-64 overflow-hidden rounded-t-lg">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold mb-1">{event.title}</h3>
                  <div className="flex items-center text-white/90">
                    <Calendar size={16} className="mr-1" />
                    {format(new Date(event.date), "MMMM d, yyyy • h:mm a")}
                  </div>
                </div>
                {event.price !== null ? (
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground font-bold py-1 px-3 rounded-full">
                    ${event.price}
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 bg-party-lavender text-party-purple font-bold py-1 px-3 rounded-full">
                    Free
                  </div>
                )}
              </div>
              <CardContent className="pt-6">
                <p className="text-muted-foreground line-clamp-2">{event.description}</p>
                <p className="font-medium mt-2">📍 {event.location}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/events/${event.id}`}>View Event Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg">
            <Link to="/events">View All Events</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
