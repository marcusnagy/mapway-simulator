import { POI } from "@/types/map";

export const filterPOIsByCategories = (pois: POI[], selectedCategories: string[]): POI[] => {
  if (selectedCategories.length === 0) return pois;
  return pois.filter(poi => 
    poi.categories?.some(category => selectedCategories.includes(category))
  );
};

export const addNewPOI = (pois: POI[], newPoi: POI): POI[] => {
  const exists = pois.some(poi => poi.placeId === newPoi.placeId);
  if (exists) return pois;
  return [...pois, newPoi];
};

export const removePOI = (pois: POI[], placeId: string): POI[] => {
  return pois.filter(poi => poi.placeId !== placeId);
};