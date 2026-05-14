import React, { useEffect, useState } from "react";
import ServiceGrid from "./ServiceGrid";
import Pagination from "./Pagination";
import { Navigate, useNavigate } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents";
import { useEventServices } from "@/hooks/useEventServices";


// const services = [
//   {
//     id: "1",
//     title: "CORPORATE EVENTS",
//     subText:"Impress clients, motivate teams",
//     imageSrc:
//       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/6f19bc52a170c6ae772c2e06231c4195038ab897?placeholderIfAbsent=true",
//   },
//   {
//     id: "2",
//     title: "DESTINATION WEDDINGS",
//     subText:"Create memories for a life time",
//     imageSrc:
//       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/66f7e6eedb68e01189650d5246c40f3ca30fa38a?placeholderIfAbsent=true",
//   },
//   {
//     id: "3",
//     title: "SWEET 16 PARTIES",
//     subText:"Celebrate in style, sparkle & joy",
//     imageSrc:
//       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/b494b20315ddadef7b3f6dd15bc1ca0c0be6ed0a?placeholderIfAbsent=true",
//   },
//   {
//     id: "4",
//     title: "CONVENTIONS",
//     subText:"Make Professional meets extraordinary",
//     imageSrc:
//       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/522d4e3acebe478f75fed8fbe4243c01a6c5c6cd?placeholderIfAbsent=true",
//   },
//   {
//     id: "5",
//     title: "BIRTHDAY PARTIES",
//     subText:"Make Professional meets extraordinary",
//     imageSrc:
//       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/6f19bc52a170c6ae772c2e06231c4195038ab897?placeholderIfAbsent=true",
//   },
//   {
//     id: "6",
//     title: "ANNIVERSARY CELEBRATIONS",
//     subText:"Make Professional meets extraordinary",
//     imageSrc:
//       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/66f7e6eedb68e01189650d5246c40f3ca30fa38a?placeholderIfAbsent=true",
//   },
//   {
//     id: "7",
//     title: "ANNIVERSARY CELEBRATIONS",
//     subText:"Make Professional meets extraordinary",
//     imageSrc:
//       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/66f7e6eedb68e01189650d5246c40f3ca30fa38a?placeholderIfAbsent=true",
//   },
//   {
//     id: "8",
//     title: "ANNIVERSARY CELEBRATIONS",
//     subText:"Make Professional meets extraordinary",
//     imageSrc:
//       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/66f7e6eedb68e01189650d5246c40f3ca30fa38a?placeholderIfAbsent=true",
//   },
  
// ];

const EventServiceCollection: React.FC = () => {
    const { data: eventServices, isLoading } = useEventServices();
    // console.log("eventServices:",eventServices)
    
  const [services,setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  // const [loading, setLoading] = useState(true);

  const totalPages = 3;
  const navigate = useNavigate();
  // useEffect(() => {
  //   const fetchServices = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await fetch("https://event-management-backend-ofpm.onrender.com/api/v1/events-hosted");
  //       const result = await response.json();
  
  //       console.log("Full API response:", result); // Log entire structure
  //       console.log("Event data array:", result.data.data); // Log just the event array
  
  //       // Format the data to match what ServiceGrid expects
  //       const formattedServices = result.data.data.map((item: any) => ({
  //         id: item.id,
  //         title: item.event_title,
  //         subText: item.short_description,
  //         imageSrc: item.featured_image,
  //       }));
  
  //       setServices(formattedServices);
  //     } catch (error) {
  //       console.error("Failed to fetch services:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  
  //   fetchServices();
  // }, []);
  
  if (isLoading) return <p className="text-center">Loading...</p>;
  if (!eventServices || eventServices.length === 0) return <p>No events found.</p>;

  // Local variable to hold venue data
  const eventsData = [...eventServices];

  const formattedEventServices = eventServices.map((eventService) => ({
    id: eventService.id,
    title: eventService.title,
    description: eventService.description, // or event.description if more suitable
    featured_image: eventService.featured_image,
    type:"eventService",
  }));
  

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // In a real application, this would fetch the appropriate data for the selected page
  };
  
  const handleViewAll = () => {
    navigate("/eventServices");
  };

  return (
    <section className="flex flex-col items-stretch max-w-7xl mx-auto px-4 pt-12">
      <header className="flex  justify-between items-stretch gap-5 text-black flex-wrap  max-md:max-w-full max-md:mr-0.5">
        <h2 className="text-[30px] font-medium max-md:text-[16px]">Event Services</h2>
        <a href="#" 
        onClick={(e) => {
          e.preventDefault(); // Prevents page reload
          handleViewAll();    // Your custom handler
        }}
        className="text-[14px] text-[#686868] font-normal my-auto hover:underline max-md:text-[10px]" >
          View All ({eventsData.length})
        </a>
      </header>

     {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading services...</div>
      ) : (
        <ServiceGrid services={formattedEventServices} />
      )}

      
    </section>
  );
};

export default EventServiceCollection;