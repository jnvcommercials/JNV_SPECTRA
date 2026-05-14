"use client";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import React, { useEffect } from "react";
import { useContactForm } from "@/hooks/useContactForm";
import { useState } from "react";
import { subWeeks } from "date-fns";

const EnquiryForm = () => {
  const { mutate, isPending, isSuccess, isError, data } = useContactForm();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  useEffect(() => {
    if (isSuccess) {
      setFormData({ name: "", email: "", phone: "", message: "", subject: "" });
    }
  }, [isSuccess]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData);
  };

  return (
    <section className="px-4 py-24 mx-auto max-w-[1440px] sm:px-6 lg:px-12">
      <h2 className="mb-16 text-4xl font-medium text-center max-sm:text-3xl max-sm:mb-10 mt-16">
        Enquire Today
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Form */}
        <div>
          <h3 className="mb-8 text-3xl font-medium max-sm:text-2xl">
            Fill out the form and we'll get back to you
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {[
        { label: "Full Name", name: "name", type: "text", placeholder: "John Doe" },
        { label: "Contact Number", name: "phone", type: "text", placeholder: "+1 (908)456-8742" },
        { label: "Email Address", name: "email", type: "email", placeholder: "john@mail.com" },
        { label: "Subject", name: "subject", type: "text", placeholder: "Subject" },
      ].map((field, i) => (
        <div key={i} className="flex flex-col gap-2">
          <label htmlFor={field.name} className="text-lg font-medium">{field.label}</label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            value={formData[field.name as keyof typeof formData]}
            onChange={handleChange}
            required
            placeholder={field.placeholder}
            className="h-14 px-5 rounded-lg bg-zinc-100 text-base text-zinc-600 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-lg font-medium">Message</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          placeholder="Your enquiry"
          className="h-40 p-5 rounded-lg bg-zinc-100 text-base text-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="h-14 text-white text-lg font-medium rounded-lg bg-[#605C4C] hover:bg-[#4F4B3D] transition"
        style={{
          background: 'linear-gradient(135deg, #4b1248cd 30%, rgb(61 9 61) 100%)',
          border: '1px solid #fff'
        }}
      >
        {isPending ? "Submitting..." : "Submit"}
      </button>

      {/* Feedback */}
      {isSuccess && <p className="text-green-600">{data?.message}</p>}
      {isError && <p className="text-red-600">Something went wrong. Please try again.</p>}
    </form>

        </div>

        {/* Contact Details */}
        <div className="space-y-8">
          <h3 className="text-3xl font-medium">Get In Touch</h3>
          <p className="text-zinc-600">
            Our event specialists are ready to assist you. Contact us for info
            on rentals, services, or planning help.
          </p>

          {[{
            icon: <MapPin className="h-6 w-6 text-primary " />,
            title: "Our Location",
            content: "Florida,USA",
          }, {
            icon: <Phone className="h-6 w-6 text-primary" />,
            title: "Phone",
            content: <a href="tel:+13527732872" className="hover:text-primary">+1 (352) 773-2872</a>,
          }, {
            icon: <Mail className="h-6 w-6 text-primary" />,
            title: "Email",
            content: <a href="mailto:info@jnvspectra.com" className="hover:text-primary">info@jnvspectra.com</a>,
          }, 
          // {
          //   icon: <Clock className="h-6 w-6 text-primary" />
          //   title: "Business Hours",
          //   content: (
          //     <>
          //       Mon - Fri: 9:00 AM - 6:00 PM<br />
          //       Sat: 10:00 AM - 4:00 PM<br />
          //       Sun: Closed
          //     </>
          //   ),
          // }
        ].map(({ icon, title, content }, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">{icon}</div>
              <div>
                <h4 className="font-semibold text-lg">{title}</h4>
                <p className="text-zinc-600">{content}</p>
              </div>
            </div>
          ))}

          {/* Map/Image */}
          <div className="h-64 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1577791465485-b80039b4d69a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Our location"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnquiryForm;
