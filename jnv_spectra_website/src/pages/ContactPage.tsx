
import Layout from "@/components/layout/Layout";
import ContactForm from "@/components/contact/ContactForm";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import FeaturedEventSection from "@/components/featured-collection/FeaturedEventSection";
import ContactCTA from "@/components/home/ContactCTA";

const ContactPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      {/* <section className="bg-party-purple text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Have questions about our rentals or services? Need a quote for your upcoming event?
            We're here to help make your event planning journey smooth and successful.
          </p>
        </div>
      </section> */}
      
      {/* Contact Content */}
      <ContactForm />
      <FeaturedEventSection/>
      
      {/* CTA */}
      <ContactCTA/>
    </Layout>
  );
};

export default ContactPage;
