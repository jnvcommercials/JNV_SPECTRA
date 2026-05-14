import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ServiceCard from "../featured-collection/ServiceCard";
import Layout from "../layout/Layout";
import FeaturedEventSection from "../featured-collection/FeaturedEventSection";
import ContactCTA from "../home/ContactCTA";
import { Button } from "../ui/button";
import SearchBar from "../search-dropdown/Search_DropDown";
import { motion } from "framer-motion";
import { useRentals } from "@/hooks/useRentals";
import { useVenues } from "@/hooks/useVenues";
import { useEventServices } from "@/hooks/useEventServices";

const AllServicesPage: React.FC = () => {
  const location = useLocation();
  // const rental_Services = location.state?.rentals || [];

  const { data: rentals, isLoading:rentalsLoading } = useRentals();
  const { data: venues, isLoading:venuesLoading } = useVenues();

   const { data: eventServices, isLoading:eventServicesLoading } = useEventServices();


  const [filteredVenues, setFilteredVenues] = useState<any[]>([]);

  if (rentalsLoading || venuesLoading || eventServicesLoading) {
    return (
      <div className="pt-40 flex flex-col items-center justify-center text-white text-lg animate-fadeIn">
        <div className="w-12 h-12 border-4 border-[#6c1466] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-black">Loading...</p>
      </div>
    );
  }

  if (!rentals || rentals.length === 0) return <p>No Rentals found.</p>;
  if (!venues || venues.length === 0) return <p>No Venues found.</p>;
  if (!eventServices || eventServices.length === 0) return <p>No Services found.</p>;

  const priorityTitles = ["LED DANCE FLOOR", "LED SCREENS", "360 DEGREE PHOTO BOOTH"];
  // Safely duplicate the array only if rentals is available
  const rental_Services = [...(rentals ?? [])];

  const prioritized = rental_Services.filter((item) =>
    priorityTitles.includes(item.title.toUpperCase())
  );

  const others = rental_Services.filter(
    (item) => !priorityTitles.includes(item.title.toUpperCase())
  );

  const sortedRentals = [...prioritized, ...others];

  const venuesData = [...(venues??[])];

const EventserviceData = [...(eventServices??[])];

  const handleSearch = (filters: any) => {
    // console.log("Filters received in AllServicesPage:", filters);
    const { guests, venue, space, rating } = filters;

    const filtered = venuesData.filter((item) => {
      let match = true;

      if (guests) {
        // Suppose you have `capacity` field on venues (adjust as needed)
        if (guests === "50") match = match && item.capacity =="50";
        else if (guests === "100") match = match && item.capacity == "100";
        else if (guests === "200") match = match &&  item.capacity == "200";
        else if (guests === "500") match = match && item.capacity == "500";
        else if (guests === "1000") match = match &&  item.capacity == "1000";
        // else if (guests === "200-plus") match = match && item.capacity > 200;
      }

      if (venue) {
        match = match && item.venue_type?.toLowerCase() === venue;
      }

      if (space) {
        match = match && item.space_preference?.toLowerCase() === space;
      }

      if (rating) {
        // console.log(parseInt(rating));
        match = match && item.rating >= parseInt(rating, 5);
      }

      return match;
    });
// console.log(filtered);
    setFilteredVenues(filtered);
  };


  const venuesToDisplay = filteredVenues.length > 0 ? filteredVenues : venuesData;
  // const rental_Services = [
  //   {
  //     id: "1",
  //     title: "Chairs",
  //     subText: "Comfort and elegance for every guest",
  //     imageSrc: "src/assets/rentalsImages/chair.jpg",
  //     description: [
  //       "Sturdy and elegant designs",
  //       "Suitable for all event types",
  //       "Available in multiple styles"
  //     ]
  //   },
  //   {
  //     id: "2",
  //     title: "Mandapam",
  //     subText: "Create a sacred space with style",
  //     imageSrc: "src/assets/rentalsImages/mandir.jpg",
  //     description: [
  //       "Traditional and modern options",
  //       "Decor-ready structures",
  //       "Ideal for weddings and rituals"
  //     ]
  //   },
  //   {
  //     id: "3",
  //     title: "Pooja Table",
  //     subText: "Essential for your ceremonial needs",
  //     imageSrc: "src/assets/rentalsImages/poojatable.jpg",
  //     description: [
  //       "Perfect for religious setups",
  //       "Compact and durable build",
  //       "Decor-friendly surface"
  //     ]
  //   },
  //   {
  //     id: "4",
  //     title: "Support Stand",
  //     subText: "Reliable support for lights and decor",
  //     imageSrc: "src/assets/rentalsImages/stand.jpg",
  //     description: [
  //       "Ideal for lights and backdrops",
  //       "Adjustable height support",
  //       "Stable and easy to install"
  //     ]
  //   },
  //   {
  //     id: "5",
  //     title: "Table",
  //     subText: "Serve, display, or gather with ease",
  //     imageSrc: "src/assets/rentalsImages/tabel1.jpg",
  //     description: [
  //       "Rectangular and square options",
  //       "Strong and stable surfaces",
  //       "Fits catering and decor needs"
  //     ]
  //   },
  //   {
  //     id: "6",
  //     title: "Round Table",
  //     subText: "Encourage connection with round seating",
  //     imageSrc: "src/assets/rentalsImages/table.jpg",
  //     description: [
  //       "Ideal for group dining",
  //       "Space-efficient layout",
  //       "Elegant linen-ready design"
  //     ]
  //   },

  
  //     {
  //     id: "7",
  //     title: "STAGE EQUIPMENT",
  //     subText: "Bring your performance alive",
  //     imageSrc:
  //       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/b494b20315ddadef7b3f6dd15bc1ca0c0be6ed0a?placeholderIfAbsent=true",
  //       description: [
  //         "Full HD clarity",
  //         "Customizable sizes",
  //         "Indoor & outdoor support"
  //       ]
  //   },
  //   {
  //     id: "8",
  //     title: "CHAIRS",
  //     subText: "Comfort meets style",
  //     imageSrc:
  //       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/522d4e3acebe478f75fed8fbe4243c01a6c5c6cd?placeholderIfAbsent=true",
  //       description: [
  //         "Full HD clarity",
  //         "Customizable sizes",
  //         "Indoor & outdoor support"
  //       ]
  //   },
  //   {
  //     id: "9",
  //     title: "LED SCREENS",
  //     subText: "Make every event vivid",
  //     imageSrc:
  //       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/6f19bc52a170c6ae772c2e06231c4195038ab897?placeholderIfAbsent=true",
  //       description: [
  //         "Full HD clarity",
  //         "Customizable sizes",
  //         "Indoor & outdoor support"
  //       ]
  //   },
  //   {
  //     id: "10",
  //     title: "DANCE FLOORS",
  //     subText: "Step up the fun",
  //     imageSrc:
  //       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/66f7e6eedb68e01189650d5246c40f3ca30fa38a?placeholderIfAbsent=true",
  //       description: [
  //         "Full HD clarity",
  //         "Customizable sizes",
  //         "Indoor & outdoor support"
  //       ]
  //   },
  //   {
  //     id: "12",
  //     title: "STAGE EQUIPMENT",
  //     subText: "Bring your performance alive",
  //     imageSrc:
  //       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/b494b20315ddadef7b3f6dd15bc1ca0c0be6ed0a?placeholderIfAbsent=true",
  //       description: [
  //         "Full HD clarity",
         
  //       ]
  //   },
  //   {
  //     id: "12",
  //     title: "CHAIRS",
  //     subText: "Comfort meets style",
  //     imageSrc:
  //       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/522d4e3acebe478f75fed8fbe4243c01a6c5c6cd?placeholderIfAbsent=true",
  //       description: [
  //         "Full HD clarity",
  //         "Customizable sizes",
        
  //       ]
  //   },
  // ];

  // const venuesData = [
  //   {
  //     id: "1",
  //     title: "THE GRAND BALLROOM",
  //     subText: "Elegant gatherings in a timeless space",
  //     imageSrc:
  //       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/15e7f6756d31856d8be5cd627fceb4d763be5b8a?placeholderIfAbsent=true",
        
  //   },
  //   {
  //     id: "2",
  //     title: "GARDEN VISTA",
  //     subText: "Celebrate amidst nature's beauty",
  //     imageSrc:
  //       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/e212046c46b958eed1950956ef34caa9df659d5a?placeholderIfAbsent=true",
  //   },
  //   {
  //     id: "3",
  //     title: "CITY LIGHTS BANQUET HALL",
  //     subText: "Chic, contemporary, and stylish",
  //     imageSrc:
  //       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/b9756a61f6a95704dfb4704a9b3787137aa0a516?placeholderIfAbsent=true",
  //   },
  //   {
  //     id: "4",
  //     title: "THE WATERFRONT PAVILION",
  //     subText: "Serene views with a luxurious setting",
  //     imageSrc:
  //       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/1e1ba578786043db442e4447ddaf0fc164909186?placeholderIfAbsent=true",
  //   },
  //   {
  //     id: "5",
  //     title: "THE LOFT OF FIFTH",
  //     subText: "Urban sophistication with skyline views",
  //     imageSrc:
  //       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/4d7a4f24339822e63c205a10b2d437170db893f5?placeholderIfAbsent=true",
  //   },
  //   {
  //     id: "6",
  //     title: "EVERGREEN ESTATE",
  //     subText: "Timeless luxury in serene surroundings",
  //     imageSrc:
  //       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/e8053e87bd4e0b1f6293133ce3318bfc4270ad2b?placeholderIfAbsent=true",
  //   },
  //   {
  //     id: "7",
  //     title: "THE WATERFRONT PAVILION",
  //     subText: "Serene views with a luxurious setting",
  //     imageSrc:
  //       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/1e1ba578786043db442e4447ddaf0fc164909186?placeholderIfAbsent=true",
  //   },
  //   {
  //     id: "8",
  //     title: "CITY LIGHTS BANQUET HALL",
  //     subText: "Celebrate in style under city lights",
  //     imageSrc:
  //       "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/60cf9948627e0d68946527cb7ca9b8b639dc8fa4?placeholderIfAbsent=true",
  //   },
  // ];

  const isVenuesPage = location.pathname.includes("venues");
  const isRentalsPage = location.pathname.includes("rentals");

  const isEventServicesPage = location.pathname.includes("eventServices");



  return (
    <Layout>
      <section className="flex flex-col gap-5 items-center justify-center text-center px-5 max-w-7xl mx-auto h-auto md:h-[520px] pt-40">
        {isVenuesPage ? (
          <>
            <h2 className="text-4xl md:text-5xl font-medium text-black">
              Discover the Perfect Venue
            </h2>
            <p className="mt-4 text-lg text-[#8b8989] max-w-[750px] md:max-w-[863px]">
              Your event deserves a setting as extraordinary as your celebration itself. From elegant
              ballrooms to vibrant outdoor spaces, we've carefully selected venues that perfectly complement
              your special day.
            </p>
          </>
        ) : isRentalsPage ? (
          <>
            <h2 className="text-4xl md:text-5xl font-medium text-black">
              Premium Event Rentals for Every Occasion
            </h2>
            <p className="mt-4 text-lg text-[#8b8989] max-w-[750px] md:max-w-[863px]">
              Elevate your events with high-quality rental solutions, from LED screens and dance floors to
              stylish seating and stage equipment.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-4xl md:text-5xl font-medium text-black">Explore Our Services</h2>
            <p className="mt-4 text-lg text-[#8b8989] max-w-[750px] md:max-w-[863px]">
              Browse our premium services tailored for unforgettable experiences.
            </p>
          </>
        )}
        <Link to="/contact">
          <Button className="mt-6 bg-[#605C4C] hover:bg-[#4F4B3D] text-white text-sm px-6 py-3 rounded-lg" style={{
        background: 'linear-gradient(135deg, #4b1248cd 30%, rgb(61 9 61) 100%)',
        border: '1px solid #fff'
      }}>
            Enquire Now
          </Button>
        </Link>
        {isVenuesPage && <SearchBar onSearch={handleSearch}/>}
      </section>

      <section className="max-w-7xl mx-auto px-4 pt-5 pb-12 md:py-16 w-full">
        {isRentalsPage ? (
          sortedRentals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sortedRentals.map((service, index) => (
               <motion.div
               key={service.id}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: index * 0.1 }}
               viewport={{ once: false, amount: 0.3 }}

               className="relative h-[500px] rounded-2xl overflow-hidden shadow-md group"
             >
               {/* Background image */}
               <div
                 className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-125"
                 style={{ backgroundImage: `url(${service.featured_image})` }}
               />
             
               {/* Overlay */}
               <div className="absolute inset-0 bg-black/35 flex flex-col justify-between text-white px-4 py-6">
                 {/* Centered Title & Subtext */}
                 <div className="flex-1 flex flex-col justify-center items-center text-center transition-all duration-300">
                   <h3 className="text-xl font-normal drop-shadow group-hover:text-xl transition-all duration-300">
                     {service.title}
                     {/* {service.featured_image} */}
                   </h3>
                   <p className="text-base drop-shadow mb-2 group-hover:text-base transition-all duration-300">
                     {service.description}
                   </p>
                 </div>
             
                 {/* Bottom Description */}
                 <div className="mt-4 text-left">
  {service.bullet_points && service.bullet_points.length > 0 && (
    <ul className="text-sm space-y-1 text-gray-200 transition-all duration-300 group-hover:text-base">
      {service.bullet_points.slice(0, 3).map((point, idx) => (
        <li key={idx} className="drop-shadow">• {point.value}</li>
      ))}
    </ul>
  )}
</div>

               </div>
             </motion.div>
             
              
              
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No rental services available.</p>
          )
        ) : isVenuesPage?(
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {venuesToDisplay.map((service,index) => (
              <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              // onClick={() => handleVenueClick(service.id)} // << Add this
              className="cursor-pointer"
            >
              <ServiceCard
                key={service.id}
                imageSrc={service.featured_image}
                subText={service.description}
                title={service.title}
                slug={service.title}
                id={service.id}
                type={
                  "venues"}
              />
                </motion.div>
            ))}
          </div>
        ):
        (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {eventServices.map((service,index) => (
            <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            // onClick={() => handleVenueClick(service.id)} // << Add this
            className="cursor-pointer"
          >
            <ServiceCard
              key={service.id}
              imageSrc={service.featured_image}
              subText={service.description}
              title={service.title}
              slug={service.title}
              id={service.id}
              type={
                "eventServices"}
            />
              </motion.div>
          ))}
        </div>)
        }
      </section>

      <FeaturedEventSection />
      <ContactCTA />
    </Layout>
  );
};

export default AllServicesPage;
