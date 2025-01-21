import { Coordinates } from "@/types/map";
import mapboxgl from 'mapbox-gl';

export async function calculateRoute(
  src: Coordinates,
  dest: Coordinates,
  map: mapboxgl.Map,
  mapboxToken: string
) {
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${src.lng},${src.lat};${dest.lng},${dest.lat}?geometries=geojson&overview=full&access_token=${mapboxToken}`
  );

  const data = await response.json();
  if (!data.routes?.[0]) {
    throw new Error('No route found');
  }

  const route = data.routes[0].geometry;

  map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: route,
    },
  });

  map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#FF6600',
      'line-width': 6,
    },
  });

  return {
    route: {
      type: 'Feature' as const,
      properties: {},
      geometry: route,
    },
    coordinates: data.routes[0].geometry.coordinates,
  };
}