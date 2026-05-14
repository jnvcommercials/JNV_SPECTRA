import AboutSection from "@/components/about/AboutSection";
import StatsSection from "@/components/about/StatsSection";
import FeaturedEventSection from "@/components/featured-collection/FeaturedEventSection";
import ContactCTA from "@/components/home/ContactCTA";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import TestimonialsSection from "../home/TestimonialSection";
import EventsCollection from "../featured-collection/EventsCollection";
import GalleryLayout from "./GalleryLayout";
import { useGallery } from "@/hooks/useGalley";


const GalleryPage = () => {
  const { data: galleryItems, isLoading } = useGallery(); // ✅ Fetch data

  // ✅ Merge all images
  const galleryImages = galleryItems?.flatMap(item => item.images) || [];

  return (
    <Layout>
      <section className="flex flex-col gap-5 items-center justify-center text-center px-5 max-w-7xl mx-auto h-auto md:h-[420px] py-20">
        <h3 className="text-4xl md:text-5xl font-medium text-black pt-10">
          Our Events in Action
        </h3>
        <p className="mt-4 text-lg text-[#8b8989] max-w-[750px] md:max-w-[863px]">
          Catch a glimpse of memorable moments from our expertly crafted events. Explore, get inspired, and see why our clients love celebrating with us!
        </p>
      </section>

      {/* ✅ Show loader while fetching */}
      {isLoading ? (
        <div className="text-center text-gray-500 py-10">Loading gallery...</div>
      ) : (
        <div className="flex flex-col px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
          <GalleryLayout images={galleryImages} />
        </div>
      )}

      {/* CTA Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
        <ContactCTA />
      </div>
    </Layout>
  );
};

export default GalleryPage;
