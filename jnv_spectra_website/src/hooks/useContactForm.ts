// hooks/useContactForm.ts
import { useMutation } from "@tanstack/react-query";
import { submitContactForm, ContactFormData } from "@/api/contact";

export const useContactForm = () => {
  return useMutation({
    mutationFn: (formData: ContactFormData) => submitContactForm(formData),
  });
};
