import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ServiceCard from "./ServiceCard";
import Pagination from "./Pagination";

interface Service {
  id: string;
  title: string;
  description: string;
  featured_image: string;
  type:string;
}

interface ServiceGridProps {
  services: Service[];
}

const ServiceGrid: React.FC<ServiceGridProps> = ({ services }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(4);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateLayout = () => {
      const screenWidth = window.innerWidth;

      if (screenWidth >= 1024) {
        setCardsPerPage(4); // Desktop
      } else if (screenWidth >= 768) {
        setCardsPerPage(2); // Tablet
      } else {
        setCardsPerPage(1); // Mobile
      }

      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  useEffect(() => {
    const updateLayout = () => {
      const screenWidth = window.innerWidth;
  
      if (screenWidth >= 1024) {
        setCardsPerPage(4);
      } else if (screenWidth >= 768) {
        setCardsPerPage(2);
      } else {
        setCardsPerPage(1);
      }
  
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };
  
    updateLayout();
    window.addEventListener("resize", updateLayout);
  
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const page = Math.round(scrollLeft / scrollContainerRef.current.clientWidth) + 1;
        setCurrentPage(page);
      }
    };
  
    const container = scrollContainerRef.current;
    container?.addEventListener("scroll", handleScroll);
  
    return () => {
      window.removeEventListener("resize", updateLayout);
      container?.removeEventListener("scroll", handleScroll);
    };
  }, []);
  

  const totalPages = Math.ceil(services.length / cardsPerPage);

  const scrollToPage = (page: number) => {
    if (scrollContainerRef.current) {
      const newScrollLeft = (page - 1) * containerWidth;
      scrollContainerRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });
      setCurrentPage(page);
    }
  };

  return (
    <section className="w-full mt-5 max-md:max-w-full max-md:mt-0">
      {/* Scrollable Services List */}
      <div className="relative overflow-hidden">
        <motion.div
          ref={scrollContainerRef}
          className="grid grid-flow-col auto-cols-[calc(100%/var(--cards-per-page))] overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollSnapType: "x mandatory",
            "--cards-per-page": cardsPerPage,
          }}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut"  }}
          viewport={{ once: true }}
        >
          {services.map((service) => (
            <div key={service.id} className="snap-start px-2 ">
              <ServiceCard
              id={service.id}
                subText={service.description}
                imageSrc={service.featured_image}
                title={service.title}
                slug={service.title}
                type={service.type}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pagination Buttons */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={scrollToPage}
          />
        </div>
      )}
    </section>
  );
};

export default ServiceGrid;
