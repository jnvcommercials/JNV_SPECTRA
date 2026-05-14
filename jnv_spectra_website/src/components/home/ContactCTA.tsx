"use client";
import React from "react";
import { Link } from "react-router-dom";

const CallToAction: React.FC = () => {
  return (
    <section className="flex flex-col items-center w-full px-4 pt-12 max-md:pt-10">
      <h2 className="mt-10 text-4xl font-medium text-black text-center max-md:mt-10 max-md:text-2xl">
        Ready to Plan Your Perfect Event?
      </h2>
      <p className="mt-4 text-lg text-center text-black max-md:text-base">
        Let's start turning your vision into reality. Get in touch today and
        make your event unforgettable!
      </p>
      <Link to="/contact">      <button className="px-16 py-3.5 mt-7 text-xl font-medium text-white rounded-2xl bg-[#4b1248cd] hover:bg-[#4F4B3D] w-[282px] max-md:w-[282px] max-md:px-5 max-md:text-lg"
       style={{
        background: 'linear-gradient(135deg, #4b1248cd 30%, rgb(61 9 61) 100%)',
        border: '1px solid #fff'
      }}
      >
        Contact Us
      </button>
      </Link>

      {/* <p className="mt-2 text-lg text-center text-black max-md:text-base">
        *it's free!!
      </p> */}
    </section>
  );
};

export default CallToAction;
