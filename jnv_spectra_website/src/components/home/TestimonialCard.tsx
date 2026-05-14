"use client";
import { MapPin } from "lucide-react";
import React from "react";

interface TestimonialCardProps {
  variant?: "standard" | "split";
  name: string;
  location: string;
  message: string;
  avatar: string;
  background?: string;
  rating?:number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  variant = "standard",
  name,
  rating,
  location,
  message,
  avatar,
  background = "https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/c7b73226b48d989a89bd62b224990fb598ed39d1?placeholderIfAbsent=true",
}) => {
  if (variant === "split") {
    return (
      <div className="flex overflow-hidden relative flex-col w-full h-[400px] rounded-3xl max-md:mt-8 mt-12 max-md:max-w-full">

        <img
          src={background}
          className="object-cover absolute inset-0 size-full"
          alt="Testimonial background"
        />
        <div className="relative pl-20 bg-black bg-opacity-50 max-md:pl-5 max-md:max-w-full">
          <div className="flex gap-5 max-md:flex-col">
            <div className="w-3/5 max-md:ml-0 max-md:w-full">
              <div className="flex relative flex-col self-stretch my-auto -mr-52 text-base max-md:mt-10">
                <p className="self-center ml-3 text-zinc-300">{location}</p>
                <blockquote className="text-center text-white">
                  "{message}"
                </blockquote>
              </div>
            </div>
            <div className="ml-5 w-2/5 max-md:ml-0 max-md:w-full">
              <div className="flex relative flex-col grow items-start px-6 pt-28 pb-48 w-full bg-white max-md:px-5 max-md:py-24">
                <div className="flex flex-col justify-center items-center ml-5 w-10 h-10 bg-white rounded-md max-md:ml-2.5">
                  <img
                    src={avatar}
                    className="object-contain z-10 -mb-1 w-full rounded-md aspect-square"
                    alt="Testimonial avatar"
                  />
                </div>
                <p className="mt-1 text-lg font-medium text-black">{name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden relative flex-col rounded-3xl h-[400px] max-md:mt-0 max-md:max-w-full">

      <img
        src={avatar}
        className="object-cover absolute inset-0 size-full"
        alt="Testimonial background"
      />
      <div className="flex relative flex-col justify-center items-center px-20 py-24 bg-black bg-opacity-50 max-md:px-5 max-md:py-24 max-md:max-w-full">
        <div className="flex flex-col items-center -mb-5 max-w-full w-[340px] max-md:mb-2.5">
          {/* <div className="flex flex-col justify-center items-center px-0.5 w-14 h-14 bg-white rounded-md">
            <img
              src={avatar}
              className="object-cover z-10  w-full rounded-md aspect-square"
              alt="Testimonial avatar"
            />
          </div> */}
          <p className="mt-1 text-lg font-medium text-white">{name}</p>
          <div className="flex mt-1">
  {Array.from({ length: 5 }).map((_, index) => (
    <span key={index} className={`text-lg ${index < rating ? "text-yellow-400" : "text-gray-400"}`}>
      ★
    </span>
  ))}
</div>

<p className="mt-6 text-base text-zinc-300 flex items-center gap-1">
  <MapPin size={16} className="text-zinc-300" /> {location}
</p>
          <blockquote className="self-stretch text-base text-center text-white">
            "{message}"
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
