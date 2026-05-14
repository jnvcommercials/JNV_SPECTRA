"use client";
import { useGallery } from "@/hooks/useGalley";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";


const MemoriesSection: React.FC = () => {
  const { data: galleryItems, isLoading } = useGallery();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Merge images from all gallery items
  const mergedImages = galleryItems
    ?.flatMap((item) => item.images)
    .slice(0, 4) || []; // Show only first 4

  // Auto-slide effect
  useEffect(() => {
    if (!mergedImages.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % mergedImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [mergedImages]);

  if (isLoading) {
    return <div className="text-center text-gray-500 mt-10">Loading memories...</div>;
  }

  return (
    <section className="flex flex-col items-center max-w-7xl mx-auto px-4 pt-12">
      <h2 className="mt-14 text-center text-3xl font-medium text-black max-md:mt-10">
        Memories We've Created
      </h2>
      <p className="mt-4 text-lg text-center text-[#8b8989] w-[896px] max-md:max-w-full">
        Take a peek at the stunning celebrations we've brought to life. Get
        inspired, envision your event, and see what's possible.
      </p>

      {/* Slideshow Container */}
      <div className="flex overflow-hidden relative flex-col items-center self-start px-20 mt-12 max-w-full text-xl font-medium text-white rounded-2xl min-h-[545px] w-[1504px] max-md:w-full max-md:aspect-square max-md:min-h-0 max-md:px-4">
        {mergedImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Memory ${index + 1}`}
            className={`absolute w-full h-full object-cover transition-opacity duration-700 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* "View All" Button */}
        <div className="flex relative flex-col items-center justify-center mt-0 mb-auto w-[180px] max-md:w-38 max-md:px-4">
          <div className="w-full bg-white rounded-t-none rounded-b-2xl px-2 pt-0 pb-2 max-md:p-2">
            <Link to="/gallery">
              <button
                className="w-full py-4 rounded-xl bg-[#4b1248cd] text-white text-center text-sm"
                style={{
                  background: "linear-gradient(135deg, #4b1248cd 30%, rgb(61 9 61) 100%)",
                  border: "1px solid #fff",
                }}
              >
                View All
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex mt-6 space-x-2">
        {mergedImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-[4px] w-8 transition-all duration-300 ${
              index === currentIndex ? "bg-[#4b1248cd]" : "bg-[#D9D9D9]"
            }`}
            style={{ borderRadius: "5px" }}
          />
        ))}
      </div>
    </section>
  );
};

export default MemoriesSection;
