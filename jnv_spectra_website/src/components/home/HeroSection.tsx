import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp } from "react-icons/fa";
import MegaMenu from "../megaMenu/MegaMenu";
import React from "react";
import { useSlider } from "@/hooks/useSliders";
import { useEvents } from "@/hooks/useEvents";
import { useEventServices } from "@/hooks/useEventServices";

// const images = [
//   "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
//   "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
//   "src/assets/bannerImages/weddingBanner.png",
//   "src/assets/bannerImages/ivan-lom-A5jPafyJPzU-unsplash.jpg",
//   "src/assets/bannerImages/1amfcs-nkxrfH-7lyY-unsplash.jpg"
// ];


const formatSlug = (text: string) => text.toLowerCase().replace(/\s+/g, "-");


const HeroSection = () => {
  const [index, setIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoMoved, setLogoMoved] = useState(false);

  const { data: sliders, isLoading } = useSlider();
  const currentSlide = sliders?.[index];

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

  useEffect(() => {
    const timer = setTimeout(() => setLogoMoved(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (logoMoved) {
      const interval = setInterval(() => {
        setIndex((prevIndex) => (prevIndex + 1) % sliders.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [logoMoved]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const [expandedCategories, setExpandedCategories] = React.useState<string[]>([]);
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };
  const [isBrowseOpen, setIsBrowseOpen] = React.useState(false);

  return (
    <section className="relative h-screen w-full overflow-hidden text-white">
      {/* Logo Centered Initially */}
      {!logoMoved && (
  <motion.div 
    initial={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 2 }}
    className="absolute inset-0 flex justify-center items-center text-4xl font-bold bg-[#4b1248]"
  >
    <AnimatePresence>
      {!isScrolled && (
        <motion.img 
          src="/jnvSpectraLogoBold.png" 
          alt="JNV Spectra Logo" 
          className="absolute inset-0 m-auto w-40 md:w-auto object-contain h-96"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 1.5 } }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  </motion.div>
)}


      {/* Header */}
      <motion.header 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: isScrolled || isHovered ? 1 : 0 }}
        transition={{ duration: 0.9 }}
        className="fixed top-0 w-full z-50 px-6 md:px-10 py-2 flex items-center justify-between mx-auto"
        style={{
          background: 'linear-gradient(135deg, #4b1248 30%, rgb(61 9 61) 100%)'
          // background:"#FFF"
        }}
      >
        {/* Logo */}
        <Link to="/">
        <img 
          src="/jnvSpectraLogoBold.png" 
          alt="JNV Spectra Logo" 
          className={`object-contain transition-all duration-300 h-20 md:h-28 ${
            isScrolled ? "w-20 md:w-28" : "w-24 md:w-36"
          }`}
        />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="nav-link text-sm text-white">Home</Link>
          <MegaMenu/>
          <Link to="/about" className="nav-link text-sm text-white">About Us</Link>
          <Link to="/contact" className="nav-link text-sm text-white">Contact Us</Link>
          <Link to="/gallery" className="nav-link text-sm text-white">Gallery</Link>
        </nav>

        {/* Social Icons + Button */}
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

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white" 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.header>

      {/* Mobile Menu */}
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

      {/* Background Image Carousel */}
      {logoMoved && (
        <>
          <div className="absolute inset-0 z-0">
            <AnimatePresence>
              <motion.div
                key={index}
                initial={{ x: "100%" }}
                animate={{ x: "0%" }}
                exit={{ x: "-100%" }}
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${currentSlide?.image_url})` }}
              />
            </AnimatePresence>
          </div>

          {currentSlide && (
            <motion.div
              className="container relative z-10 flex flex-col justify-center items-center h-full text-center px-4"
              key={currentSlide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="font-semibold text-3xl md:text-5xl mb-4 leading-tight">
                {currentSlide.title}
              </h1>
              <h2 className="text-xl md:text-2xl mb-3 font-light text-white/80">
                {currentSlide.subtitle}
              </h2>
              <p className="text-base md:text-lg mb-6 max-w-2xl text-white/90">
                {currentSlide.content}
              </p>
              {/* {currentSlide.cta_text && (
                <a
                  href={currentSlide.cta_link}
                  className="inline-block bg-white text-black font-medium px-6 py-2 rounded-full hover:bg-gray-200 transition"
                >
                  {currentSlide.cta_text}
                </a>
              )} */}
            </motion.div>
          )}
        </>
      )}

      {/* Down Scroll Indicator */}
      <div className="absolute bottom-6 inset-x-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce space-y-2">
        <h6 className="text-white text-sm font-medium tracking-wide">Scroll</h6>
        <span className="w-5 h-5 border-b-2 border-r-2 border-white rotate-45"></span>
      </div>
    </section>
  );
};

export default HeroSection;
