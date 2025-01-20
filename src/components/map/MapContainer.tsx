import { useEffect, useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import mapboxgl from 'mapbox-gl';
import { Coordinates } from '@/types/map';
import { useToast } from "@/hooks/use-toast";
import RouteSimulation from './RouteSimulation';
import { latLngToCell, cellToBoundary } from "h3-js";
import 'mapbox-gl/dist/mapbox-gl.css'; // Import Mapbox CSS needed for the markers.
import { addPOIMarkers } from '../mapui/HoverCardMarker';

interface MapContainerProps {
  mapboxToken: string;
  source: Coordinates | null;
  destination: Coordinates | null;
  speed: number;
  isSimulating: boolean;
  isCanceled: boolean;
  setRouteStatus: React.Dispatch<React.SetStateAction<"idle" | "crawling" | "querying" | "done">>;
  onRouteCalculated: () => void;
  onSimulationEnd: () => void;
  setIsMapLoaded: (loaded: boolean) => void;
  children?: React.ReactNode;
}

const MapContainer = ({ 
  mapboxToken, 
  source, 
  destination,
  speed,
  isSimulating,
  isCanceled,
  setRouteStatus,
  onRouteCalculated,
  onSimulationEnd,
  setIsMapLoaded 
}: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const sourceMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);
  const [currentRoute, setCurrentRoute] = useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);
  const { toast } = useToast();

  // Clear existing route and markers
  const clearRouteAndMarkers = () => {
    if (map.current) {
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
      }
      if (map.current.getSource('route')) {
        map.current.removeSource('route');
      }
      if (map.current.getLayer('hexagons-layer')) {
        map.current.removeLayer('hexagons-layer');
      }
      if (map.current.getLayer('hexagons-outline')) {
        map.current.removeLayer('hexagons-outline');
      }
      if (map.current.getSource('hexagons')) {
        map.current.removeSource('hexagons');
      }
    }
    
    if (sourceMarker.current) {
      console.log('Removing source marker');
      sourceMarker.current.remove();
      sourceMarker.current = null;
    }
    
    if (destinationMarker.current) {
      console.log('Removing destination marker');
      destinationMarker.current.remove();
      destinationMarker.current = null;
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    console.log('Initializing map');

    try {
      mapboxgl.accessToken = mapboxToken;
      
      if (!mapboxgl.supported()) {
        throw new Error('Your browser does not support Mapbox GL');
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [10, 50], // Center of Europe
        zoom: 4, // High zoom to see all of Europe
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setIsMapLoaded(true);
        toast({
          title: "Success",
          description: "Map initialized successfully",
        });
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        toast({
          variant: "destructive",
          title: "Map Error",
          description: e.error.message || "An error occurred with the map",
        });
      });

      return () => {
        clearRouteAndMarkers();
        map.current.remove();
        map.current = null;
        setIsMapLoaded(false);
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initialize map",
      });
      setIsMapLoaded(false);
    }
  }, [mapboxToken, setIsMapLoaded, toast]);

  useEffect(() => {
    if (map.current && source && !destination) {
      console.log('Updating source marker:', source);
      map.current.flyTo({
        center: [source.lng, source.lat],
        zoom: 10,
      });
      sourceMarker.current = new mapboxgl.Marker({ color: '#808080' })
        .setLngLat([source.lng, source.lat])
        .addTo(map.current);
    } else {
      console.log('No source marker');
    }
  }, [map, source]);

  // Handle marker updates and route calculation
  useEffect(() => {
    if (!map.current || !map.current.loaded()) {
      console.log('Map not ready for updates');
      return;
    }

    console.log('Updating markers and route:', { source, destination });
    clearRouteAndMarkers();

    // Update source marker
    if (source) {
      console.log('Adding source marker:', source);
      map.current.flyTo({
        center: [source.lng, source.lat],
        zoom: 10,
      });
      sourceMarker.current = new mapboxgl.Marker({ color: '#808080' })
        .setLngLat([source.lng, source.lat])
        .addTo(map.current);
    } else {
      console.log('No source marker');
    }

    // Update destination marker
    if (destination) {
      console.log('Adding destination marker:', destination);
      destinationMarker.current = new mapboxgl.Marker({ color: '#505050' })
        .setLngLat([destination.lng, destination.lat])
        .addTo(map.current);
      
       map.current.flyTo({
          center: [source.lng, source.lat],
          zoom: 12,
        });
    } else {
      console.log('No destination marker');
    }

    // Calculate route if both markers are present
    if (source && destination) {
      console.log('Calculating route');
      calculateRoute(source, destination);
    }
  }, [source, destination]);

  const calculateRoute = async (src: Coordinates, dest: Coordinates) => {
    if (!map.current) return;

    try {
      console.log('Calculating route between:', src, dest);
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${src.lng},${src.lat};${dest.lng},${dest.lat}?geometries=geojson&overview=full&access_token=${mapboxToken}`
      );

      const data = await response.json();
      const route = data.routes[0].geometry;

      if (!data.routes?.[0]) {
        throw new Error('No route found');
      }

      // Add route to the map
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: route,
      },
    });

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
      'line-join': 'round',
      'line-cap': 'round',
      },
      paint: {
      'line-color': '#FF6600', // Neon orange color
      'line-width': 6,
      },
    });

      setCurrentRoute(
        {
          type: 'Feature',
          properties: {},
          geometry: route,
        }
      );

      const coordinates = data.routes[0].geometry.coordinates;
      const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: number[]) => {
        return bounds.extend([coord[0], coord[1]]);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      map.current.fitBounds(bounds, {
        padding: 200
      });

      const hexCollection: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
        type: "FeatureCollection",
        features: [],
      }
      
      const visitedCells = new Set<string>();
      
      // Convert route coords ([lng, lat]) to hex polygons
      route.coordinates.forEach(([lng, lat]) => {
      const h3Index = latLngToCell(lat, lng, 7); // pick suitable resolution
      if (visitedCells.has(h3Index)) return;
      visitedCells.add(h3Index);

      const boundary = cellToBoundary(h3Index, true); // [[lat, lng], ...]
      console.log('Adding hexagon:', h3Index, boundary);
      const polygon: GeoJSON.Feature<GeoJSON.Polygon> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            boundary,
          ],
        },
      };
        console.log('Adding hexagon:', polygon);
        hexCollection.features.push(polygon);
      });

      // Add or update the hexagons source & layer
    if (!map.current.getSource('hexagons')) {
      console.log('Adding hexagons source and layer');
      map.current.addSource('hexagons', {
        type: 'geojson',
        data: hexCollection,
      });
      map.current.addLayer({
        id: 'hexagons-layer',
        type: 'fill',
        source: 'hexagons',
        paint: {
          'fill-color': '#808080', // A medium grey color
          'fill-opacity': 0.2, // Lower opacity for better visibility of the map
        },
      }, 'route');
      map.current.addLayer({
        id: 'hexagons-outline',
        type: 'line',
        source: 'hexagons',
        layout: {},
        paint: {
          'line-color': '#000000', // Black color for the outline
          'line-width': 1, // Width of the outline
        },
      });
    } else {
      (map.current.getSource('hexagons') as mapboxgl.GeoJSONSource).setData(hexCollection);
    }

      // Send hexagons to the backend
      await sendHexRequest(hexCollection);

      setRouteStatus("querying");

      // Fetch POI data for the visited cells
      const poiData = await fetchPOIData(visitedCells);
      if (poiData && map.current) {
        await addPOIMarkers(poiData.pois, map.current);
      }
      setRouteStatus("done");

      onRouteCalculated();
      toast({
        title: "Success",
        description: "Route calculated successfully",
      });
    } catch (error) {
      console.error('Error calculating route:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to calculate route",
      });
    }
  };

  return (
    <div ref={mapContainer} className="absolute inset-0">
      {isSimulating && currentRoute && map.current && (
        <RouteSimulation
          map={map.current as mapboxgl.Map}
          route={currentRoute}
          speed={speed}
          onSimulationEnd={onSimulationEnd}
          isCanceled={isCanceled}
        />
      )}
    </div>
  );
};

export default MapContainer;

// async function addPOIMarkers(pois: any[], map: mapboxgl.Map) {
//   for (const poi of pois) {
//     const { locationLat, locationLng, imageUrl } = poi;
//     if (!locationLat || !locationLng) continue;

//     const markerEl = document.createElement("div");
//     markerEl.style.width = "40px";
//     markerEl.style.height = "40px";
//     markerEl.style.borderRadius = "50%";
//     markerEl.style.cursor = "pointer";
//     markerEl.style.backgroundSize = "cover";
//     markerEl.style.backgroundImage = imageUrl
//       ? `url(${imageUrl})`
//       : "url('https://img.icons8.com/?size=100&id=JnKur3Cocs7X&format=png&color=FD7E14')"; // example default marker

//     const popupHtml = ReactDOMServer.renderToString(<POIPopup poi={poi} />);
//     const popup = new mapboxgl.Popup({ closeButton: true, closeOnClick: true }).setHTML(popupHtml);

//     popup.on('open', () => {
//       const clostBtn = popup.getElement().querySelector('.mapboxgl-popup-close-button')
//       if (clostBtn) {
//         clostBtn.removeAttribute('aria-hidden');
//       }
//     });

//     new mapboxgl.Marker(markerEl)
//       .setLngLat([locationLng, locationLat])
//       .setPopup(popup)
//       .addTo(map);
//   }
// }

async function fetchPOIData(visitedCells: Set<string>) {
  const cells = [...visitedCells];
  const queryString = cells.map((cell) => `parentCells=${encodeURIComponent(cell)}`).join('&');
  const res = await fetch(`/v1/poi/h3?${queryString}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch POI data. Status: ${res.status}`);
  }
  const data = await res.json();
  console.log('POI data:', data);
  return data;
};

async function sendHexRequest(hexCollection: GeoJSON.FeatureCollection<GeoJSON.Polygon>) {
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
    maxCrawledPlacesPerSearch:3,
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