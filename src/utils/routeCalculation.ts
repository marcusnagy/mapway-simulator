import { Coordinates } from "@/types/map";

export const calculateRoute = async (source: Coordinates, destination: Coordinates, mapboxToken: string) => {
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}?geometries=geojson&access_token=${mapboxToken}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to calculate route');
  }
  
  return await response.json();
};

export const simulateRoute = (
  coordinates: number[][],
  speed: number,
  onUpdate: (position: number[]) => void,
  onComplete: () => void,
  isCanceled: boolean
) => {
  let currentIndex = 0;
  const interval = setInterval(() => {
    if (isCanceled || currentIndex >= coordinates.length) {
      clearInterval(interval);
      onComplete();
      return;
    }
    
    onUpdate(coordinates[currentIndex]);
    currentIndex++;
  }, (1000 * 3600) / (speed * coordinates.length));
  
  return interval;
};