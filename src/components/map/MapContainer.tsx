import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Coordinates, HexagonPOISet, POI } from '@/types/map';
import { useToast } from "@/hooks/use-toast";
import RouteSimulation from './RouteSimulation';
import { latLngToCell, cellToBoundary, cellToChildren } from "h3-js";
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
  allPOIs: POI[];
  setAllPOIs: React.Dispatch<React.SetStateAction<POI[]>>;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
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
  setIsMapLoaded,
  allPOIs,
  setAllPOIs,
  selectedCategories,
  setSelectedCategories,
}: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const sourceMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);
  const poiMarkersRef = useRef<HexagonPOISet>(new HexagonPOISet());
  const hexCells = useRef<string[]>([]);
  const lastHexRef = useRef<string | null>(null);
  const [currentRoute, setCurrentRoute] = useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);
  const [oldCategories, setOldCategories] = useState<string[]>([]);
  const { toast } = useToast();

  const addMarkersSafely = async (pois: POI[]) => {
    const newMarkers = await addPOIMarkers(pois, map.current); // Bulk create markers

    // Add the created markers to poiMarkersRef
    newMarkers.getAll().forEach((marker) => {
    if (!poiMarkersRef.current.has(marker.placeId)) {
      poiMarkersRef.current.add(marker);
    } else {
      console.warn(`Marker for POI ${marker.placeId} already exists.`);
    }
  });
  };

  function simulationOnComplete() {
    lastHexRef.current = "initial";
    addMarkersByCategory(allPOIs, selectedCategories);
  }

  // Add markers for POIs in selected categories
  function addMarkersByCategory(pois: POI[], categories: string[]) {
    if (!map.current) return;
    
    // Use a Set to collect unique POIs
    const uniquePOIs = new Map<string, POI>();
    // Step 1: Filter the POIs based on the selected categories and existing markers
     // Step 1: Filter POIs based on selected categories and add to uniquePOIs
    pois.forEach((poi) => {
      if (
        poi.placeId &&
        poi.categories?.some((cat) => categories.includes(cat)) &&
        !poiMarkersRef.current.has(poi.placeId) // Ensure it's not already added
      ) {
        uniquePOIs.set(poi.placeId, poi);
      }
    });

    // Step 2: Add all filtered POIs in one go using addMarkersSafely
    if (uniquePOIs.size > 0) {
      addMarkersSafely(Array.from(uniquePOIs.values()));
    }
    console.log('Added markers for unique POIs:', uniquePOIs.size);
  }

  // Remove markers for POIs in selected categories
  function removeMarkersByCategory(categories: string[], pois?: POI[]) {
    if (pois && pois.length > 0) {
      // Remove markers for the provided POIs
      pois.forEach((poi) => {
        if (poi.placeId && poiMarkersRef.current.has(poi.placeId)) {
          console.log("Removing marker for placeId:", poi.placeId);
          const hexPoi = poiMarkersRef.current.get(poi.placeId);
          hexPoi?.marker.remove();
          poiMarkersRef.current.delete(poi.placeId);
        }
      });
    } else {
      console.log('Removing markers for categories:', categories);
      // Remove markers from any POI with these categories
      poiMarkersRef.current.getAll().forEach((hexPoi) => {
        const { placeId, poi } = hexPoi;
        if (hexPoi.poi && (poi.categories?.some((cat) => categories.includes(cat)) || !poi.categories?.length)) {
          console.log("Removing marker for placeId:", placeId);
          hexPoi.marker.remove();
          poiMarkersRef.current.delete(hexPoi.placeId);
        }
      });
      console.log('Current POI Markers:', poiMarkersRef.current.getAll());
    }
  }

  // Update markers when selected categories change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
    console.log('Selected categories changed:', selectedCategories);

    // If there are no selected categories, remove all POI markers
    if (selectedCategories.length === 0) {
      console.log('No categories selected, removing all markers');
      poiMarkersRef.current.getAll().forEach((hexPoi) => hexPoi.marker.remove());
      poiMarkersRef.current = new HexagonPOISet();
      setOldCategories([]);
      return;
    }

    // Step 2: Collect all POIs for the selected categories
    const relevantPOIs = allPOIs.filter((poi) =>
      poi.categories?.some((cat) => selectedCategories.includes(cat))
    );

    // Step 3: Add markers for unique POIs
    addMarkersByCategory(relevantPOIs, selectedCategories);

    // Remove markers for categories that got turned off
    // Categories removed
    const removedCategories = oldCategories.filter((cat) => !selectedCategories.includes(cat));
    if (removedCategories.length > 0) {
      console.log("Removing markers for categories:", removedCategories);
      removeMarkersByCategory(removedCategories);
    }

    setOldCategories(selectedCategories);
  }, 200);
  return () => clearTimeout(timeoutId);
  }, [selectedCategories, allPOIs]);

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
      poiMarkersRef.current.getAll().forEach(hexPoi => hexPoi.marker.remove());
      poiMarkersRef.current = new HexagonPOISet();
      hexCells.current = [];
      lastHexRef.current = "initial";
      setAllPOIs([]);
      setOldCategories([]);
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

  // Handle source marker updates
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
      
      // Convert route coords ([lng, lat]) to hex polygons
      route.coordinates.forEach(([lng, lat]) => {
      const h3Index = latLngToCell(lat, lng, 7);
      if (hexCells.current.includes(h3Index)) return;
      hexCells.current.push(h3Index);

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
    setRouteStatus("querying");

    // Fetch POI data for the visited cells
    const poiData = await fetchPOIData(hexCells.current);
    const categories: Set<string> = new Set();
    if (poiData && map.current) {
      setAllPOIs(poiData.pois);
      for (const poi of poiData.pois) {
        if (poi.categories) {
          poi.categories.forEach((cat: string) => categories.add(cat));
          
        }
      }
      console.log('Categories:', categories);
      setSelectedCategories(Array.from(categories));
    }

      setRouteStatus("crawling");
      // Send hexagons to the backend
      await sendHexRequest(hexCollection);

      setRouteStatus("querying");

      // After crawling, fetch more POIs
      const newPoiData = await fetchPOIData(hexCells.current);
      const newPois: POI[] = [];
      // Fetch POI data for the visited cells
      if (newPoiData && map.current) {
        // Merge newly fetched POIs into existing state
        setAllPOIs((prev) => {
        const merged = [...prev];
        newPoiData.pois.forEach((poi: POI) => {
          // If we don't have it yet, add to merged
          if (poi.placeId && !merged.some((p) => p.placeId === poi.placeId)) {
            merged.push(poi);
            newPois.push(poi);
          }
        });
        return merged;
      });
      // Only add new markers in selected categories
      newPois.forEach(async (poi) => {
        if (
          !poi.categories?.some((cat) => selectedCategories.includes(cat))
        ) {
          poi.categories.forEach((cat: string) => categories.add(cat));
          
        }
      });
      if (newPois.length > 0) {
        setSelectedCategories(Array.from(categories));
      }
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

  const handleStepChange = async (step: number, route: GeoJSON.Feature<GeoJSON.LineString>) => {
    console.log('Step change:', step);
  
    // 1) Remove all POI markers
    if (lastHexRef.current === "initial") {
      console.log('Initial hexagon already processed');
      poiMarkersRef.current.getAll().forEach(poi => poi.marker.remove());
      poiMarkersRef.current = new HexagonPOISet();
    }
  
    // 2) Calculate the current hexagon index of the route based on the current step
    const coordinates = route.geometry.coordinates;
    const currentCoord = coordinates[step];
    // Convert the current coordinate to a hexagon index
    const currentHex = latLngToCell(currentCoord[1], currentCoord[0], 7);
  
    // 3) Determine the hexagons that are 3 steps ahead
    const idx = hexCells.current.findIndex((hex) => hex === currentHex);
    if (idx === -1) {
      console.error('Current hexagon not found in the list');
      return;
    }
    const aheadHexes = hexCells.current.slice(idx, Math.min(idx + 3, hexCells.current.length));

    const aheadHexCollectionRes9 = aheadHexes.flatMap((hex) => cellToChildren(hex, 9)); // POIs indexed at resolution 9 in the database

    // 3) Filter POIs by selected categories and ahead hexagons
    if (lastHexRef.current === currentHex) {
      console.log('Current hexagon already processed');
      return
    }
    const poisInAheadHexes = allPOIs.filter(
      (poi) =>
        poi.categories?.some((cat) => selectedCategories.includes(cat)) &&
        aheadHexCollectionRes9.includes(poi.h3Index)
    );
  
    // 4) Add markers for POIs in the ahead hexagons
    addMarkersByCategory(poisInAheadHexes, selectedCategories);

    // 5) Remove POIs from hexagons that are left behind
    const passedHexes = hexCells.current.slice(0, idx);
    const passedHexCellsRes9 = passedHexes.flatMap((hex) => cellToChildren(hex, 9)); // POIs indexed at resolution 9 in the database
    const poisInPassedHexes = allPOIs.filter(
      (poi) =>
        poi.categories?.some((cat) => selectedCategories.includes(cat)) &&
        passedHexCellsRes9.includes(poi.h3Index)
    );
    removeMarkersByCategory(selectedCategories, poisInPassedHexes);
    lastHexRef.current = currentHex;
  }

  return (
    <div ref={mapContainer} className="absolute inset-0">
      {isSimulating && currentRoute && map.current && (
        <RouteSimulation
          map={map.current as mapboxgl.Map}
          route={currentRoute}
          speed={speed}
          onSimulationEnd={onSimulationEnd}
          isCanceled={isCanceled}
          onStepChange={handleStepChange}
          onComplete={simulationOnComplete}
        />
      )}
    </div>
  );
}

export default MapContainer;

async function fetchPOIData(visitedCells: string[]) {
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