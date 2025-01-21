export interface Coordinates {
  lat: number;
  lng: number;
  children?: React.ReactNode;
}

export interface HexagonPOI {
  placeId: string;
  h3Index: string;
  marker: mapboxgl.Marker;
  poi: POI;
}

export class HexagonPOISet {
  private poiMap: Map<string, HexagonPOI>;

  constructor() {
    this.poiMap = new Map();
  }

  add(poi: HexagonPOI): boolean {
    if (this.has(poi.placeId)) {
      return false; // POI with the same placeId already exists
    }
    this.poiMap.set(poi.placeId, poi);
    return true;
  }

  get(placeId: string): HexagonPOI | undefined {
    return this.poiMap.get(placeId);
  }

  delete(placeId: string): boolean {
    return this.poiMap.delete(placeId);
  }

  getAll(): HexagonPOI[] {
    return Array.from(this.poiMap.values());
  }

  has(placeId: string): boolean {
    return this.poiMap.has(placeId);
  }

  getWithinH3Indexes(h3Indexes: string[]): HexagonPOI[] {
    return this.getAll().filter((poi) => h3Indexes.includes(poi.h3Index));
  }
}

export function findPOIByPlaceId(pois: HexagonPOI[], placeId: string): HexagonPOI[] {
  return pois.filter(poi => poi.placeId === placeId);
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
  placeId?: string;
  locationLat?: number;
  locationLng?: number;
  h3Index?: string;
  categories?: Array<string>;
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