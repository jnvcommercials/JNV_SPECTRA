
// Define our core data types for the application

export interface RentalItem {
  id: string;
  name: string;
  description: string;
  price: number;
  priceUnit: string; // "per day", "per hour", etc.
  imageUrl: string;
  category: string;
  availableQuantity: number;
  tags: string[];
  featured?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  price: number | null; // null if free
  category: string;
  status: 'upcoming' | 'ongoing' | 'past';
  featured?: boolean;
  tags: string[];
}

export interface BookingInquiry {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  eventType: string;
  guestCount: number;
  message: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface FilterOptions {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  date?: string;
  searchQuery?: string;
  tags?: string[];
}
