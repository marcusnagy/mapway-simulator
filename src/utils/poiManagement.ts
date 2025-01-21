import { POI, HexagonPOI, HexagonPOISet } from "@/types/map";
import { createPOIMarker } from '@/components/mapui/HoverCardMarker';
import mapboxgl from 'mapbox-gl';

export async function addMarkerSafely(
  poi: POI,
  map: mapboxgl.Map | null,
  poiMarkersRef: React.MutableRefObject<HexagonPOISet>
) {
  if (!map || poiMarkersRef.current.has(poi.placeId)) return;
  const marker = await createPOIMarker(poi, map);
  poiMarkersRef.current.add({
    placeId: poi.placeId,
    h3Index: poi.h3Index,
    marker,
    poi,
  });
}

export function addMarkersByCategory(
  pois: POI[],
  categories: string[],
  map: mapboxgl.Map | null,
  poiMarkersRef: React.MutableRefObject<HexagonPOISet>
) {
  if (!map) return;
  pois.forEach(async (poi) => {
    if (
      poi.placeId &&
      poi.categories?.some((cat) => categories.includes(cat))
    ) {
      await addMarkerSafely(poi, map, poiMarkersRef);
    }
  });
}

export function removeMarkersByCategory(
  categories: string[],
  poiMarkersRef: React.MutableRefObject<HexagonPOISet>,
  pois?: POI[]
) {
  if (pois && pois.length > 0) {
    pois.forEach((poi) => {
      if (poi.placeId && poiMarkersRef.current.has(poi.placeId)) {
        const hexPoi = poiMarkersRef.current.get(poi.placeId);
        hexPoi?.marker.remove();
        poiMarkersRef.current.delete(poi.placeId);
      }
    });
  } else {
    poiMarkersRef.current.getAll().forEach((hexPoi) => {
      const { placeId, poi } = hexPoi;
      if (hexPoi.poi && (poi.categories?.some((cat) => categories.includes(cat)) || !poi.categories?.length)) {
        hexPoi.marker.remove();
        poiMarkersRef.current.delete(placeId);
      }
    });
  }
}