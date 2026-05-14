import React from "react";
import { Link } from "react-router-dom";

interface EnquireButtonProps {
  text?: string;
  className?: string;
}

const EnquireButton: React.FC<EnquireButtonProps> = ({
  text = "Enquire Now",
  className = "",
}) => {
  return (
    <Link to="/contact">
    <button
      className={`flex items-center justify-center text-xl text-white rounded-2xl cursor-pointer bg-stone-600 h-12 hover:bg-[#4F4B3D] w-full ${className}`}
      style={{
        background: 'linear-gradient(135deg, #4b1248cd 30%, rgb(61 9 61) 100%)',
        border: '1px solid #fff'
      }}
    >
      {text}
    </button>
    </Link>
  );
};

export default EnquireButton;
