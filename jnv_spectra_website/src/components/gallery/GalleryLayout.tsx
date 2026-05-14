"use client";
import React from "react";
import { motion } from "framer-motion";

interface GalleryProps {
  images: string[];
}

const GalleryLayout: React.FC<GalleryProps> = ({ images }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-0">
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {images.map((img, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            viewport={{ once: false }}
            className="w-full break-inside-avoid overflow-hidden rounded-lg shadow-md"
          >
            <img
              src={img}
              alt={`Gallery-${idx}`}
              className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GalleryLayout;
