import React from "react";
import { Link } from "react-router-dom";

interface ServiceCardProps {
  id:string;
  imageSrc: string;
  subText: string;
  title: string;
  slug:string;
  className?: string;
  type:string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  imageSrc,
  subText,
  title,
  slug,
  className = "",
  type,
}) => {
  return (
    <Link 
    to={
      type === "venues"
        ? `/venues/${slug}`
        : type === "events"
        ? `/events/${slug}`
        : `/eventServices/${slug}`
    }
    
    state={{ id }} className={`flex w-full  flex-col items-stretch h-full transform transition-all duration-300 hover:scale-105  rounded-3xl ${className}`}>
         
      <img
        src={imageSrc}
        alt={title}
        className="aspect-[1.52] object-cover  w-full rounded-t-3xl "
      />
      
      <div className="flex items-center justify-between mt-4 h-full ">
        <div className="flex flex-col ">
          {/* <div className="text-[#707070] text-[8px] leading-tight">{subText}</div> */}
          <div className="text-[#1a1a1a] text-[16px] font-medium line-clamp-2 h-11">{title}</div>
        </div>
        <button
          className="bg-[#4b1248cd] hover:bg-[#4F4B3D] text-xs text-white font-medium px-[25px] py-[7px] rounded-[14px] max-md:pl-5" 
          style={{
            background: 'linear-gradient(135deg, #4b1248cd 30%, rgb(61 9 61) 100%)',
            border: '1px solid #fff'
          }}
          aria-label={`Enquire about ${title}`}
        >
          View
        </button>
      </div>
    </Link>
  );
};

export default ServiceCard;
