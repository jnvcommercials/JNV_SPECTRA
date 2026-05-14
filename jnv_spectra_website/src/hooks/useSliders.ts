// src/hooks/useSlider.ts

import { useQuery } from "@tanstack/react-query";
import { getAllSliders, SliderItem } from "@/api/sliders";

export const useSlider = () => {
  return useQuery<SliderItem[]>({
    queryKey: ["sliders"],
    queryFn: getAllSliders,
  });
};
