// components/rentals/RentalCard.tsx
import React from "react";
import { motion } from "framer-motion";

interface RentalCardProps {
  imageSrc: string;
  title: string;
  subText?: string;
  delay?: number;
}

const RentalCard: React.FC<RentalCardProps> = ({
  imageSrc,
  title,
  subText,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      viewport={{ once: true }}
      className="relative w-full h- rounded-0 overflow-hidden shadow-md"
    >
      {/* Background Image */}
      <img
        src={imageSrc}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay for text contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-30" />

      {/* Text Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4 text-center z-10">
        <h3 className="text-2xl font-bold">{title}</h3>
        {subText && <p className="text-sm mt-2">{subText}</p>}
      </div>
    </motion.div>
  );
};

export default RentalCard;
