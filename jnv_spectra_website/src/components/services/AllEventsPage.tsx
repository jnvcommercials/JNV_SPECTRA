import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../layout/Layout";
import { Button } from "../ui/button";
import EventCard from "./EventCard";
import FeaturedEventSection from "../featured-collection/FeaturedEventSection";
import ContactCTA from "../home/ContactCTA";
import { useEvents } from "@/hooks/useEvents";
import Pagination from "../featured-collection/Pagination";

interface Event {
  id: number;
  title: string;
  description: string;
  idealFor: string;
  eventSize: string;
  tagType: string;
  backgroundImage: string;
}

const AllEventsPage: React.FC = () => {
  const { data: events = [], isLoading } = useEvents(); // from API
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const totalPages = Math.ceil(events.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEvents = events.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // optional for a nice smooth scroll
    });
  }, [currentPage]);
  

  // Simulate fetching events
  // useEffect(() => {
  //   const fetchEvents = async () => {
  //     // Replace this later with an actual API call if needed
  //     const fetchedEvents: Event[] = [
  //       {
  //         id: 1,
  //         title: "Corporate Events",
  //         description: "Professional planning that impresses your clients and team",
  //         idealFor: "Any Corporate Event",
  //         eventSize: "Medium",
  //         tagType: "onDemand",
  //         backgroundImage: "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/848ee0e239e31ae6aa5747f810b6c659dbde3881?placeholderIfAbsent=true",
  //       },
  //       {
  //         id: 2,
  //         title: "Wedding",
  //         description: "Beautiful weddings crafted to your vision.",
  //         idealFor: "Large Gatherings",
  //         eventSize: "Large",
  //         tagType: "premium",
  //         backgroundImage: "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/3c9f83c897941fb8a4e06869011e941326f53098?placeholderIfAbsent=true",
  //       },
  //       {
  //         id: 3,
  //         title: "Sweet 16 Parties",
  //         description: "Make the 16th birthday unforgettable!",
  //         idealFor: "Teen Celebrations",
  //         eventSize: "Medium",
  //         tagType: "onDemand",
  //         backgroundImage: "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/802c2ff423f819f5f6a589fae5018408a1dccb16?placeholderIfAbsent=true",
  //       },
  //       {
  //         id: 4,
  //         title: "Product Launches",
  //         description: "Launch your new products with an unforgettable event!",
  //         idealFor: "Businesses",
  //         eventSize: "Small/Medium",
  //         tagType: "premium",
  //         backgroundImage: "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/fake-url-here",
  //       },
  //     ];
  //     setEvents(fetchedEvents);
  //   };

  //   fetchEvents();
  // }, []);

  // const totalPages = Math.ceil(events.length / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const currentEvents = events.slice(startIndex, startIndex + itemsPerPage);

  return (

    
    <Layout>
      {/* Hero Section */}
      <section className="flex flex-col gap-5 items-center justify-center text-center px-5 max-w-7xl mx-auto h-auto md:h-[420px] pt-28">
        <h2 className="text-4xl md:text-5xl font-medium text-black">Explore Our Events</h2>
        <p className="mt-4 text-lg text-[#8b8989] max-w-[750px] md:max-w-[863px]">
          Every event deserves special attention. From corporate gatherings and beautiful weddings to memorable birthdays—
          we offer expertly planned and professionally executed services customized to your unique vision
        </p>
        <Link to="/contact">
          <Button
            className="mt-6 bg-[#605C4C] hover:bg-[#4F4B3D] text-white text-sm px-6 py-3 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #4b1248cd 30%, rgb(61 9 61) 100%)',
              border: '1px solid #fff'
            }}
          >
            Enquire Now
          </Button>
        </Link>
      </section>

      {/* Events Section */}
      <section className="max-w-7xl mx-auto px-4 pb-12 flex flex-col items-center">
      {currentEvents.map((event) => (
  <div key={event.id} className="w-full">
    <EventCard
      title={event.title}
      description={event.description}
      id={event.id}
      // idealFor={event.bullet_points?.[0]?.label || ""}
      // eventSize={event.bullet_points?.[0]?.value || ""}
      bulletPoints={event.bullet_points}
      tagType="premium"
      backgroundImage={event.featured_image}
    />
    {/* <p className="mt-5 text-lg text-black max-md:max-w-full">
      {event.description}
    </p> */}
  </div>
))}


        {/* Pagination Controls */}
 
            {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </section>

      <FeaturedEventSection />
      <ContactCTA />
    </Layout>
  );
};

export default AllEventsPage;
