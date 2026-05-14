import { motion } from "framer-motion";
import * as React from "react";

const StatItem = ({
  number,
  description,
}: {
  number: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col items-center ">
      <h3 className="text-3xl font-semibold text-[#1a1a1a]">{number}</h3>
      <p className="text-1xl text-[#1a1a1a] text-center">{description}</p>
    </div>
  );
};

const StatsSection = () => {
  return (
    <section className="flex gap-32 justify-center px-5 py-8 mb-10  bg-[#e2cee1cd] max-md:flex-col max-md:gap-10 mt-12">
      <StatItem number="50+" description="Inventory" />
      <StatItem number="200+" description="Customers" />
      <StatItem number="500+" description="Events" />
      <motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  <StatItem number="∞" description="Countless Memories" />
</motion.div>

    </section>
  );
};

export default StatsSection;
