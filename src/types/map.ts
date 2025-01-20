export interface Coordinates {
  lat: number;
  lng: number;
  children?: React.ReactNode;
}

export interface POI {
  title?: string;
  address?: string;
  phone?: string;
  website?: string;
  reviewsCount?: number;
  totalScore?: number;
  openingHours?: Array<{ day: string; hours: string }>;
  imageUrl?: string | null;
  description?: string;
  locatedIn?: string;
  plusCode?: string;
  menu?: string;
  reserveTableUrl?: string;
  hotelStars?: string;
  hotelDescription?: string;
  checkInDate?: string;
  checkOutDate?: string;
  similarHotelsNearby?: Record<string, any>;
  hotelReviewSummary?: Record<string, any>;
  popularTimesLiveText?: string;
  popularTimesLivePercent?: number;
  popularTimesHistogram?: Record<string, Record<string, Array<{ hour: number; occupancyPercent: number }>>>; // data -> day -> hour, occupancyPercent
  questionsAndAnswers?: Record<string, any>;
  updatesFromCustomers?: string;
  webResults?: Record<string, any>;
  parentPlaceUrl?: string;
  tableReservationLinks?: Record<string, any>;
  bookingLinks?: Record<string, any>;
  orderBy?: Record<string, any>;
  images?: string;
  imageUrls?: string[];
  reviews?: Record<string, any>;
  userPlaceNote?: string;
  restaurantData?: Record<string, any>;
  ownerUpdates?: Record<string, any>;
  children?: React.ReactNode;
}