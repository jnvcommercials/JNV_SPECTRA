"use client";
import * as React from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp } from "react-icons/fa";
import MegaMenu from "../megaMenu/MegaMenu";
import { useEvents } from "@/hooks/useEvents";
import { useEventServices } from "@/hooks/useEventServices";



const formatSlug = (text: string) => text.toLowerCase().replace(/\s+/g, "-");


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const [expandedCategories, setExpandedCategories] = React.useState<string[]>([]);

   const { data: eventList = [] } = useEvents();
  const { data: eventServicesList = [] } = useEventServices();
  
  const servicesData = [
    {
      route: "events",
      category: "Event Planning",
      // subcategories: [
      //   "Corporate Events",
      //   "Weddings",
      //   "Sweet 16 Parties",
      //   "Product Launches",
      //   "Convention",
      // ],
      subcategories: eventList.map((event) => event.title),
    },
    {
      route: "eventServices",
      category: "Event Services",
      // subcategories: [
      //   "Venue Decoration",
      //   "Photography",
      //   "Audio & Video Solutions",
      //   "Catering and much more",
      // ],
      subcategories: eventServicesList.map((service) => service.title),
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

const toggleCategory = (category: string) => {
  setExpandedCategories((prev) =>
    prev.includes(category)
      ? prev.filter((c) => c !== category)
      : [...prev, category]
  );
};
const [isBrowseOpen, setIsBrowseOpen] = React.useState(false);



  return (
    <>
      <motion.header 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
        className="fixed top-0 w-full z-50 bg-white px-6 md:px-10 py-2 flex items-center justify-between mx-auto"
        style={{
          background: 'linear-gradient(135deg, #4b1248 30%, rgb(61 9 61)  100%)'
          // background:"#FFF"
        }}
      >
        {/* <div className="container py-3 my-4 flex items-center justify-between bg-white rounded-full px-6 md:px-10 w-10/12 mx-auto"> */}
          {/* Logo */}
          <Link to="/">
          <img 
            // src="src/assets/logoImages/jnvSpectraLogoBold.png" 
            src="/jnvSpectraLogoBold.png"
            alt="JNV Spectra Logo" 
           className="object-contain transition-all duration-300 h-20 md:h-28 "
          />
          </Link>



          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6  relative">
            <Link to="/" className="nav-link text-sm">Home</Link>
           
        
<MegaMenu />

            <Link to="/about" className="nav-link text-sm">About Us</Link>
            <Link to="/contact" className="nav-link text-sm">Contact Us</Link>
            <Link to="/gallery" className="nav-link text-sm">Gallery</Link>
          </nav>

          {/* Desktop Social Icons + CTA */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/JNVSPECTRA" target="_blank" rel="noopener noreferrer" className="text-white hover:text-stone-600 transition">
                <FaFacebookF size={18} />
              </a>
              <a href="https://www.instagram.com/jnvspectra/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-stone-600 transition">
                <FaInstagram size={18} />
              </a>
               <a
               href="https://Wa.me/+13527732872" // Replace with your actual WhatsApp number
               target="_blank"
               rel="noopener noreferrer"
               className="text-white hover:text-stone-600 transition"
             >
               <FaWhatsapp size={18} />
             </a>
            </div>
            <Link to="/contact">
            <Button
  className="text-white text-sm font-medium px-5 py-2 rounded-full shadow-md transition-transform duration-300 hover:scale-105"
  style={{
    background: 'transparent',
    border: '1px solid rgb(253 207 106)',
    color:"rgb(253 207 106)"
  }}
>
  Enquire Now
</Button>
</Link>

          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white" 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        {/* </div> */}
      </motion.header>

      {/* Mobile Slide-in Menu */}
      <AnimatePresence>
  {isMenuOpen && (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 right-0 w-64 h-full bg-[#FFF] shadow-lg z-50 flex flex-col items-start px-6 py-10 space-y-4"
      
    >
      <button
        className="absolute top-4 right-4 text-black"
        onClick={() => setIsMenuOpen(false)}
        aria-label="Close menu"
      >
        <X size={24} />
      </button>

      <nav className="flex flex-col space-y-4 w-full">
        <Link to="/" className="text-black text-sm" onClick={() => setIsMenuOpen(false)}>Home</Link>

        {/* Browse Dropdown */}
        <button
          onClick={() => setIsBrowseOpen(!isBrowseOpen)}
          className="text-black text-sm text-left"
        >
          Browse
        </button>

        {isBrowseOpen && (
          <div className="ml-4 flex flex-col space-y-1">
            {servicesData.map((item, idx) => (
              <div key={idx}>
                {item.subcategories.length > 0 ? (
  <button
    onClick={() => toggleCategory(item.category)}
    className="text-black text-left font-medium py-2 border-b border-gray-300 hover:text-[#6c2e70] hover:pl-1 transition-all duration-200 w-full"
  >
    {item.category}
  </button>
) : (
  <button
    // to={`/${formatSlug(item.route)}`}
    onClick={() => setIsMenuOpen(false)}
    className="text-black text-left font-medium py-2 border-b border-gray-300 hover:text-[#6c2e70] hover:pl-1 transition-all duration-200 w-full"
  >
    <Link
    to={`/${formatSlug(item.route)}`}>
    {item.category}
    </Link>
  </button>
)}



                <AnimatePresence initial={false}>
                  {expandedCategories.includes(item.category) && item.subcategories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="ml-4 flex flex-col text-sm space-y-2 gap-2"
                    >
                      {item.subcategories.map((sub, i) => (
                        <Link
                                                      key={i}
                                                      to={`/${formatSlug(item.route)}/${formatSlug(sub)}`}
                                                      state={{ id: item.route === "events" ? eventList[i].id : eventServicesList[i].id }}
                                                      className="text-gray-700 hover:text-[#6c2e70] transition"
                                                      onClick={() => setIsMenuOpen(false)}
                                                    >
                                                      {sub}
                                                    </Link>
                      ))}
                    </motion.div>
                  )}

                  {/* {expandedCategories.includes(item.category) && item.subcategories.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="ml-4"
                    >
                      <Link
                        to={`/${formatSlug(item.route)}`}
                        className="text-gray-700 hover:text-[#6c2e70] text-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        View All
                      </Link>
                    </motion.div>
                  )} */}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        <Link to="/about" className="text-black text-sm" onClick={() => setIsMenuOpen(false)}>About Us</Link>
        <Link to="/contact" className="text-black text-sm" onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
        <Link to="/gallery" className="text-black text-sm" onClick={() => setIsMenuOpen(false)}>Gallery</Link>
      </nav>

      <Link to="/contact" className="w-full" onClick={() => setIsMenuOpen(false)}>
      <Button
  className="text-white text-sm font-medium px-5 py-2 rounded-full shadow-md transition-transform duration-300 hover:scale-105"
  style={{
    background: 'transparent',
    border: '1px solid rgb(253 207 106)',
    color:"rgb(253 207 106)"
  }}
>
  Enquire Now
</Button>
      </Link>

      <div className="flex space-x-4 mt-4">
        <a href="https://www.facebook.com/JNVSPECTRA" target="_blank" rel="noopener noreferrer" className="text-black hover:text-[#6c2e70] transition">
          <FaFacebookF size={18} />
        </a>
        <a href="https://www.instagram.com/jnvspectra/" target="_blank" rel="noopener noreferrer" className="text-black hover:text-[#6c2e70] transition">
          <FaInstagram size={18} />
        </a>
          <a
          href="https://Wa.me/+13527732872" // Replace with your actual WhatsApp number
          target="_blank"
          rel="noopener noreferrer"
          className="text-black hover:text-[#6c2e70] transition"
        >
          <FaWhatsapp size={18} />
        </a>
      </div>
    </motion.div>
  )}
</AnimatePresence>


    </>
  );
};

export default Header;
