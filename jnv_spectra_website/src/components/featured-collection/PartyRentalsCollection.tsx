import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRentals } from "@/hooks/useRentals";

const PartyRentalsCollection: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: rentals, isLoading } = useRentals();

  // Duplicate the array multiple times (to make it long enough to scroll)
  const duplicatedServices = [...(rentals ?? []), ...(rentals ?? []), ...(rentals ?? [])];

  useEffect(() => {
    if (!rentals || rentals.length === 0) return;
  
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
  
    const scrollStep = 1;
    const intervalTime = 20;
  
    const scroll = () => {
      if (!scrollContainer) return;
  
      scrollContainer.scrollLeft += scrollStep;
  
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollContainer.scrollLeft = 0;
      }
    };
  
    const interval = setInterval(scroll, intervalTime);
    return () => clearInterval(interval);
  }, [rentals]);
  

  const handleViewAll = () => {
    navigate("/rentals", { state: { rentals } });
  };

  if (isLoading) return <p className="text-center">Loading...</p>;

  if (!rentals || rentals.length === 0) {
    return <p className="text-center">No rentals available.</p>;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 pt-12 relative">
      <header className="flex justify-between items-center mb-6 flex-wrap">
        <h2 className="text-[30px] font-medium max-md:text-[16px]">
          Rent & Celebrate Stress-Free
        </h2>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleViewAll();
          }}
          className="text-[14px] text-[#686868] hover:underline max-md:text-[10px]"
        >
          View All ({rentals.length})
        </a>
      </header>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-20 pb-2 snap-x no-scrollbar scroll-smooth"
          style={{ scrollBehavior: "auto", whiteSpace: "nowrap" }}
        >
          {duplicatedServices.map((service, index) => (
            <div
              key={`${service.id}-${index}`}
              className="flex flex-col items-center min-w-[140px] max-w-[140px] flex-shrink-0"
            >
              <div className="w-[200px] h-[200px] rounded-full overflow-hidden border border-gray-200 shadow-sm">
                <img
                  src={service.featured_image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-medium mt-2 text-center">
                {service.title}
              </p>
            </div>
          ))}
        </div>

        {/* Left and right gradient fades */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white via-white/70 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white via-white/70 to-transparent z-10" />
      </div>
    </section>
  );
};

export default PartyRentalsCollection;
