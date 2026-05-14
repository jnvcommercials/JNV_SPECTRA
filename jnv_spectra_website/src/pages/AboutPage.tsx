
import AboutSection from "@/components/about/AboutSection";
import StatsSection from "@/components/about/StatsSection";
import FeaturedEventSection from "@/components/featured-collection/FeaturedEventSection";
import ContactCTA from "@/components/home/ContactCTA";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="flex flex-col gap-9 justify-center items-center px-5 w-full pt-40 ">
      <h2 className="text-4xl font-medium text-center text-black max-md:text-5xl max-sm:text-4xl">
        <span >Welcome to  </span>
        <span>JNV SPECTRA</span>
      </h2>

      <h3 className="text-4xl font-thin text-center text-black max-md:text-4xl max-sm:text-3xl">
  <span className="[font-family:cursive] text-balance">Your Dream. Our Expertise.</span>
  <br />
  <span className="[font-family:cursive]">Let’s Make Magic Together! </span>
</h3>

    </section>

    <AboutSection
  title="About Us"
  description={
    <>
      <p className="mb-4">
        At <strong>JNV Spectra</strong>, we believe every event is a story waiting to be told — and we’re here to help you tell it beautifully.
      </p>
      <p className="mb-4">
        Rooted in creativity, professionalism, and attention to detail, we specialize in planning and executing unforgettable events tailored to your unique vision.
      </p>
      <p className="mb-4">
        From grand corporate gatherings and dream destination weddings to lively birthday bashes and themed celebrations, our team brings passion and precision to every occasion. We manage everything—from venue selection and décor to entertainment and logistics—ensuring a seamless, stress-free experience.
      </p>
      <p className="mb-4">
        What sets <strong>JNV Spectra</strong> apart is our commitment to making every event not just successful, but truly memorable. We blend fresh ideas with flawless execution—whether it's an elegant anniversary, a vibrant cultural fest, or a fun-filled sweet 16.
      </p>
      <p>
        Let <strong>JNV Spectra</strong> turn your moments into memories — with events that shine as bright as your celebration.
      </p>
    </>
  }
  imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/af84d39e6c45be75b565490cb50664e659168e6b"
  imagePosition="right"
/>




<AboutSection
  title="What We Offer?"
  description={
    <>
      We understand that hospitality isn’t just a service—it’s an experience.
      <br /><br />
      At <strong>JNV Spectra</strong>, our hospitality team ensures each guest is greeted with warmth, care, and exceptional attention. From streamlined registration to round-the-clock assistance, we prioritize comfort and convenience at every step.
      <br /><br />
      Whether you're an artist, volunteer, or attendee, we provide quality accommodation, tasty meals, travel support, and personalized guidance to make your stay smooth and enjoyable.
      <br /><br />
      We go the extra mile so you can immerse yourself in the moment while we handle the rest—because you deserve to celebrate without worry.
    </>
  }
  imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/5e137b30374a994f75635e92203f828fcdc97bb0"
  imagePosition="left"
/>

<AboutSection
  title="Who We Are?"
  description={
    <>
      <strong>JNV Spectra</strong> is a vibrant event management company driven by imagination and excellence. We’re known for creating stylish, unforgettable celebrations that balance creativity with expert coordination.
      <br /><br />
      Our diverse services include planning full-scale events and offering high-quality rentals such as chairs, tables, LED screens, and dance floors—perfect for customizing any venue.
      <br /><br />
      Whether it’s a private party or a public festival, we provide the tools and talent to elevate every occasion.
      <br /><br />
      More than just planners, we are storytellers who transform your vision into beautifully executed events that leave a lasting impression.
    </>
  }
  imageUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/bcedd3cd6e9ebf14e98947d4a41408cddd83846b"
  imagePosition="right"
/>
<StatsSection />
      
      

      <FeaturedEventSection/>
      
      {/* CTA */}
      <ContactCTA/>
    </Layout>
  );
};

export default AboutPage;
