import { POI } from "@/types/map";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchAndMergePOIs(
  hexCells: string[],
  setAllPOIs: React.Dispatch<React.SetStateAction<POI[]>>,
  selectedCategories: string[],
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>
) {
  const newPoiData = await fetchPOIData(hexCells);
  const newPois: POI[] = [];
  const categories: Set<string> = new Set();

  if (newPoiData) {
    setAllPOIs((prev) => {
      const merged = [...prev];
      newPoiData.forEach((poi: POI) => {
        if (poi.placeId && !merged.some((p) => p.placeId === poi.placeId)) {
          merged.push(poi);
          newPois.push(poi);
        }
      });
      return merged;
    });

    newPois.forEach((poi) => {
      if (!poi.categories?.some((cat) => selectedCategories.includes(cat))) {
        poi.categories.forEach((cat: string) => categories.add(cat));
      }
    });

    if (newPois.length > 0) {
      setSelectedCategories(Array.from(categories));
    }
  }
}

export async function fetchPOIData(visitedCells: string[]) {
  const cells = [...visitedCells];
  const queryString = cells.map((cell) => `parentCells=${encodeURIComponent(cell)}`).join('&');
  const res = await fetch(`/v1/poi/h3?${queryString}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch POI data. Status: ${res.status}`);
  }
  
  // Check if the response supports streaming
  if (!res.body) {
    throw new Error('The response body is null, unable to stream data.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let responseText = '';
  let done = false;
  const allPOIs = [];

  while (!done) {
    const { value, done: isDone } = await reader.read();
    done = isDone;
    if (value) {
      // Decode the chunk and append it to the response text
      responseText += decoder.decode(value, { stream: true });

      // Try to parse the accumulated response text
      try {
        const data = JSON.parse(responseText.trim());
        if (data.result && data.result.pois) {
          allPOIs.push(...data.result.pois);
          responseText = ''; // Clear the response text after successful parsing
        }
      } catch (error) {
        // If parsing fails, continue accumulating more chunks
      }
    }
  }

  if (allPOIs.length === 0) {
    throw new Error('No POIs found in the response.');
  }
  return allPOIs;
};

export async function sendHexRequest(hexCollection: GeoJSON.FeatureCollection<GeoJSON.Polygon>, maxPlaces: number = 3) {
  // Transform each polygon feature into the API’s MultiPolygon format
  const polygons = hexCollection.features.map((feature) => {
    // Each feature.geometry.coordinates is [ [ [lng, lat], [lng, lat], ...] ]
    const coordsArray = feature.geometry.coordinates[0].map(([lng, lat]) => ({
      longitude: lng,
      latitude: lat,
    }))
    return { coordinates: coordsArray }
  })

  console.log('Sending hex request:', polygons);

  const body = {
    maxCrawledPlacesPerSearch: maxPlaces,
    customGeolocation: {
      type: "MULTIPOLYGON",
      polygons: polygons,
    },
    allPlacesNoSearchAction: "ALL_PLACES_NO_SEARCH_OCR"
    // ...fill out other fields as needed
  };

  const res = await fetch("/v1/maps/search/scraper", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  console.log('Hex request response:', res);
  if (!res.ok) {
    throw new Error(`Failed to send hex request. Status: ${res.status}`);
  }
}