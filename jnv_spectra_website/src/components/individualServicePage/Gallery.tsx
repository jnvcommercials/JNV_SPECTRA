"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

// Utility to chunk the images
export function chunkImages<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

interface GalleryProps {
  images: string[]; // Flat image list
}

const GalleryCollage: React.FC<GalleryProps> = ({ images }) => {
  const imageGroups = chunkImages(images, 5);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Scroll to the selected group on dot click
  const handleDotClick = (index: number) => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const scrollAmount = scrollContainer.offsetWidth * index;
      scrollContainer.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Track scroll position to update active dot
  const handleScroll = () => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const index = Math.round(
        scrollContainer.scrollLeft / scrollContainer.offsetWidth
      );
      setCurrentIndex(index);
    }
  };

  // Handle wheel scroll event for sideways scroll
  const handleWheel = (event: WheelEvent) => { // Use native WheelEvent type
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      // Check the scroll direction (up or down)
      const delta = event.deltaY;
      const scrollAmount = scrollContainer.offsetWidth;

      if (delta > 0) {
        // Scroll down -> Move right
        scrollContainer.scrollTo({
          left: scrollContainer.scrollLeft + scrollAmount,
          behavior: "smooth",
        });
      } else if (delta < 0) {
        // Scroll up -> Move left
        scrollContainer.scrollTo({
          left: scrollContainer.scrollLeft - scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

 

  return (
    <div className="w-full max-w-[1500px] mx-auto">
      {/* Scrollable Gallery */}
      <div ref={scrollRef} className="overflow-x-auto scroll-smooth no-scrollbar">
        <div className="flex gap-6 px-2 py-4 w-max h-auto">
          {imageGroups.map((group, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="flex flex-wrap gap-2 w-[95vw] md:w-[1500px] flex-shrink-0"
            >
              {/* Left Large Image */}
              {group[0] && (
                <div className="w-full md:w-[48%] max-h-[650px] overflow-hidden">
                  <img
                    src={group[0]}
                    alt={`Gallery ${index + 1}-1`}
                    className="w-full h-full object-cover  transition-all duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Right Side Columns */}
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-[50%]">
                {/* Middle Column */}
                <div className="flex flex-col w-full md:w-1/2 gap-2">
                  {group[1] && (
                    <div className="h-[200px] md:h-[60%] overflow-hidden">
                      <img
                        src={group[1]}
                        alt={`Gallery ${index + 1}-2`}
                        className="w-full h-full object-cover  transition-all duration-500 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  {group[2] && (
                    <div className="h-[200px] md:h-[40%] overflow-hidden">
                      <img
                        src={group[2]}
                        alt={`Gallery ${index + 1}-3`}
                        className="w-full h-full object-cover  transition-all duration-500 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>

                {/* Last Column */}
                <div className="flex flex-col w-full md:w-1/2 gap-2">
                  {group[3] && (
                    <div className="h-[200px] md:h-[40%] overflow-hidden">
                      <img
                        src={group[3]}
                        alt={`Gallery ${index + 1}-4`}
                        className="w-full h-full object-cover  transition-all duration-500 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  {group[4] && (
                    <div className="h-[200px] md:h-[60%] overflow-hidden">
                      <img
                        src={group[4]}
                        alt={`Gallery ${index + 1}-5`}
                        className="w-full h-full object-cover  transition-all duration-500 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-6 space-x-2">
        {imageGroups.map((_, index) => (
          <span
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-[4px] w-8 transition-all duration-300 cursor-pointer ${
              index === currentIndex ? "bg-[#4b1248cd]" : "bg-[#D9D9D9]"
            }`}
            style={{ borderRadius: "5px" }}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default GalleryCollage;
