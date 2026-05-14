
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedRentals from "@/components/home/FeaturedRentals";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import ServiceCategories from "@/components/home/ServiceCategories";
import TestimonialSection from "@/components/home/TestimonialSection";
import ContactCTA from "@/components/home/ContactCTA";
import FeaturedCollection from "@/components/featured-collection/EventsCollection";
import EventsCollection from "@/components/featured-collection/EventsCollection";
import PartyRentalsCollection from "@/components/featured-collection/PartyRentalsCollection";
import MemoriesSection from "@/components/home/MemoriesSection";
import VenuesCollection from "@/components/featured-collection/VenueCollection";
import StatsSection from "@/components/about/StatsSection";
import EventServiceCollection from "@/components/featured-collection/EventServiceCollection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <EventsCollection/>
      <EventServiceCollection/>
      <VenuesCollection/>
      <PartyRentalsCollection/>
      <StatsSection/>
      <MemoriesSection/>
      
      {/* <ServiceCategories /> */}
      {/* <FeaturedRentals /> */}
      {/* <UpcomingEvents /> */}
      <TestimonialSection />
      <ContactCTA />
      
    </Layout>
  );
};

export default Index;
