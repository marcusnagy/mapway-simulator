export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RoutePoint {
  coordinates: Coordinates;
  timestamp: number;
}

export interface POI {
  id: string;
  name: string;
  coordinates: Coordinates;
  type: string;
}