// api/contact.ts
import axios from "axios";
import {
  API_BASE_URL,
  ENDPOINTS,
  DEFAULT_HEADERS,
  REQUEST_TIMEOUT,
  handleApiError,
} from "./config";

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  subject:string;
  phone: string; // optional field if you need it
}

export const submitContactForm = async (
  formData: ContactFormData
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}${ENDPOINTS.contact}`,
      formData,
      {
        headers: DEFAULT_HEADERS,
        timeout: REQUEST_TIMEOUT,
      }
    );

    return {
      success: true,
      message: "Form submitted successfully!",
    };
  } catch (error) {
    handleApiError(error);
    return {
      success: false,
      message: "Something went wrong while submitting the form.",
    };
  }
};
