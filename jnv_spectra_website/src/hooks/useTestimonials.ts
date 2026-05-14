import { useQuery } from "@tanstack/react-query";

import { getAllTestimonials, Testimonial } from "@/api/testimonials";

export const useTestimonials = () => {
  return useQuery<Testimonial[] | null>({
    queryKey: ["testimonials"],
    queryFn: getAllTestimonials,
  });
};
