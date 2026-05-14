import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" }); // or "smooth"
  }, [pathname]);

  return null;
};

export default ScrollToTop;

