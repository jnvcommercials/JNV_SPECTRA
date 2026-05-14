"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents"; // ✅ Make sure the path is correct
import { useEventServices } from "@/hooks/useEventServices";

const servicesData = [
  {
    route: "events",
    category: "Event Planning",
    subcategories: [], // We'll fetch dynamically

    // subcategories: [
    //   "Corporate Events",
    //   "Weddings",
    //   "Sweet 16 Parties",
    //   "Product Launches",
    //   "Convention",
    // ],
  },
  {
    route: "eventServices",
    category: "Event Services",
    subcategories: [
      "Venue Decoration",
      "Photography",
      "Audio & Video Solutions",
      "Catering and much more",
    ],
  },
  {
    route: "rentals",
    category: "Party Rentals",
    subcategories: [],
  },
  {
    route: "venues",
    category: "Venues",
    subcategories: [],
  },
];

const MegaMenu = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(servicesData[0].category);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: events, isLoading: eventsLoading } = useEvents(); // ✅ fetch events
  const {data: eventServices,isLoading:eventServicesLoading} = useEventServices()

  const formatSlug = (text: string) =>
    text.toLowerCase().replace(/\s+/g, "-");

  const hasSubcategories = servicesData.find(
    (service) =>
      service.category === activeCategory &&
      service.subcategories.length > 0
  );

  return (
    <div className="relative">
      {/* Browse Button */}
      <div className="flex justify-center">
        <span
          className="nav-link text-sm font-medium cursor-pointer hover:text-[#FFF] transition"
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          Browse
        </span>
      </div>

      {/* Mega Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 top-[60px] transform -translate-x-1/2 z-40 w-[90vw] max-w-3xl px-4"
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
          >
            <div
              className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mx-auto px-4 py-6 grid gap-6 transition-all ${
                hasSubcategories ? "md:grid-cols-3" : "md:grid-cols-3"
              }`}
            >
              {/* Categories */}
              <div className={hasSubcategories ? "border-r pr-6" : ""}>
                {servicesData.map((service, index) => (
                  <Link
                    to={`/${formatSlug(service.route)}`}
                    key={index}
                    className={`block p-2.5 text-base font-medium rounded-md transition-all ${
                      activeCategory === service.category
                        ? "text-[#6c2e70] bg-gray-100"
                        : "text-[#1a1a1a]"
                    } hover:bg-gray-100 hover:text-[#6c2e70] hover:scale-110`}
                    onMouseEnter={() => setActiveCategory(service.category)}
                  >
                    {service.category}
                  </Link>
                ))}
              </div>

              {/* Subcategories */}
              <div className="md:col-span-2 grid gap-2">
  {activeCategory === "Event Planning" ? (
    eventsLoading ? (
      <div className="text-center text-gray-500">Loading...</div>
    ) : events && events.length > 0 ? (
      events.map((event) => (
        <Link
          key={event.id}
          to={`/events/${formatSlug(event.title)}`}
          state={{ id: event.id }}
          className="block text-sm text-gray-600 hover:text-[#6c2e70] hover:scale-105 transition"
        >
          {event.title}
        </Link>
      ))
    ) : (
      <div className="text-center text-gray-500">No Events Found</div>
    )
  ) : activeCategory === "Event Services" ? (
    eventServicesLoading ? (
      <div className="text-center text-gray-500">Loading...</div>
    ) : eventServices && eventServices.length > 0 ? (
      eventServices.map((service) => (
        <Link
          key={service.id}
          to={`/eventServices/${formatSlug(service.title)}`}
          state={{ id: service.id }}
          className="block text-sm text-gray-600 hover:text-[#6c2e70] hover:scale-105 transition"
        >
          {service.title}
        </Link>
      ))
    ) : (
      <div className="text-center text-gray-500">No Services Found</div>
    )
  ) : (
    hasSubcategories?.subcategories.map((sub, index) => (
      <Link
        key={index}
        to={`/services/${formatSlug(sub)}`}
        className="block text-sm text-gray-600 hover:text-[#6c2e70] hover:scale-105 transition"
      >
        {sub}
      </Link>
    ))
  )}
</div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MegaMenu;
