"use client";
import React, { useRef, useState, useEffect } from "react";
import TestimonialCard from "./TestimonialCard";
import { useTestimonials } from "@/hooks/useTestimonials";

const cardWidth = 350; // Adjust based on actual card width + margin

const TestimonialsSection: React.FC = () => {
  const { data: testimonials, isLoading, isError } = useTestimonials();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const scrollLeft = scrollRef.current.scrollLeft;
        const index = Math.round(scrollLeft / cardWidth);
        setCurrentIndex(index);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

  if (isLoading) return <p className="text-center py-10">Loading testimonials...</p>;
  if (isError || !testimonials) return <p className="text-center py-10">Failed to load testimonials.</p>;

  return (
    <section className="flex flex-col items-center max-w-7xl mx-auto px-4 py-0">
      <h2 className="mt-12 py-8 text-3xl font-medium text-black max-md:mt-10">
        What Our Clients Say
      </h2>

      <div className="relative w-full">
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth snap-x px-10 no-scrollbar"
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="snap-start">
              <TestimonialCard
                name={testimonial.client_name}
                location={testimonial.location}
                message={testimonial.feedback}
                avatar={testimonial.featured_image_url}
                rating = {testimonial.rating}
              />
            </div>
          ))}
        </div>

        <div className="flex mt-6 space-x-2 justify-center">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              aria-label={`Go to testimonial ${index + 1}`}
              className={`h-[4px] w-8 transition-all duration-300 ${
                index === currentIndex ? "bg-[#4b1248cd]" : "bg-[#D9D9D9]"
              }`}
              style={{ borderRadius: "5px" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
