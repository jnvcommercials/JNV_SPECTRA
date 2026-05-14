import React, { useState } from "react";
import ServiceGrid from "./ServiceGrid";
import Pagination from "./Pagination";
import { useNavigate } from "react-router-dom";
import { useVenues } from "@/hooks/useVenues";

 // const venuesData = [
  //   {
  //     id: "1",
  //     title: "THE GRAND BALLROOM",
  //     subText: "Elegant gatherings in a timeless space",
  //     imageSrc: "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/15e7f6756d31856d8be5cd627fceb4d763be5b8a?placeholderIfAbsent=true",
  //   },
  //   {
  //     id: "2",
  //     title: "GARDEN VISTA",
  //     subText: "Celebrate amidst nature's beauty",
  //     imageSrc: "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/e212046c46b958eed1950956ef34caa9df659d5a?placeholderIfAbsent=true",
  //   },
  //   {
  //     id: "3",
  //     title: "CITY LIGHTS BANQUET HALL",
  //     subText: "Chic, contemporary, and stylish",
  //     imageSrc: "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/b9756a61f6a95704dfb4704a9b3787137aa0a516?placeholderIfAbsent=true",
  //   },
  //   {
  //     id: "4",
  //     title: "THE WATERFRONT PAVILION",
  //     subText: "Serene views with a luxurious setting",
  //     imageSrc: "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/1e1ba578786043db442e4447ddaf0fc164909186?placeholderIfAbsent=true",
  //   },
  //   {
  //     id: "5",
  //     title: "THE LOFT OF FIFTH",
  //     subText: "Urban sophistication with skyline views",
  //     imageSrc: "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/4d7a4f24339822e63c205a10b2d437170db893f5?placeholderIfAbsent=true",
  //   },
  //   {
  //     id: "6",
  //     title: "EVERGREEN ESTATE",
  //     subText: "Timeless luxury in serene surroundings",
  //     imageSrc: "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/e8053e87bd4e0b1f6293133ce3318bfc4270ad2b?placeholderIfAbsent=true",
  //   },
  //   {
  //     id: "7",
  //     title: "THE WATERFRONT PAVILION",
  //     subText: "Serene views with a luxurious setting",
  //     imageSrc: "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/1e1ba578786043db442e4447ddaf0fc164909186?placeholderIfAbsent=true",
  //   },
  //   {
  //     id: "8",
  //     title: "CITY LIGHTS BANQUET HALL",
  //     subText: "Celebrate in style under city lights",
  //     imageSrc: "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/60cf9948627e0d68946527cb7ca9b8b639dc8fa4?placeholderIfAbsent=true",
  //   },
  // ];

const VenuesCollection: React.FC = () => {
  const { data: venues, isLoading } = useVenues();
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Conditional UI states
  if (isLoading) return <p className="text-center">Loading...</p>;
  if (!venues || venues.length === 0) return <p>No venues found.</p>;

  // Local variable to hold venue data
  const venuesData = [...venues];

  const formattedVenues = venuesData.map((venue) => ({
    id: venue.id,
    title: venue.title,
    description:venue.description, // or event.description if more suitable
    featured_image: venue.featured_image,
    type:"venues",
  }));
  

  const handleViewAll = () => {
    navigate("/venues", { state: { services: venuesData } });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Add pagination logic here if required in the future
  };

  return (
    <section className="flex flex-col items-stretch max-w-7xl mx-auto px-4 pt-12">
      <header className="flex justify-between items-center gap-5 text-black flex-wrap max-md:max-w-full max-md:mr-0.5">
        <h2 className="text-[30px] font-medium max-md:text-[16px]">
          Discover the Perfect Venue
        </h2>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleViewAll();
          }}
          className="text-[14px] text-[#686868] font-normal my-auto hover:underline max-md:text-[10px]"
        >
          View All ({venuesData.length})
        </a>
      </header>

      <ServiceGrid services={formattedVenues} />

      {/* Optional Pagination Component Placeholder */}
      {/* <Pagination currentPage={currentPage} totalPages={3} onPageChange={handlePageChange} /> */}
    </section>
  );
};

export default VenuesCollection;
