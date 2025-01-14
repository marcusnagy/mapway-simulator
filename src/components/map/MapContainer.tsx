import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Coordinates } from '@/types/map';
import { useToast } from "@/hooks/use-toast";
import RouteSimulation from './RouteSimulation';

interface MapContainerProps {
  mapboxToken: string;
  source: Coordinates | null;
  destination: Coordinates | null;
  speed: number;
  isSimulating: boolean;
  onRouteCalculated: () => void;
  onSimulationEnd: () => void;
  setIsMapLoaded: (loaded: boolean) => void;
}

const MapContainer = ({ 
  mapboxToken, 
  source, 
  destination,
  speed,
  isSimulating,
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
    }
    
    if (sourceMarker.current) {
      sourceMarker.current.remove();
      sourceMarker.current = null;
    }
    
    if (destinationMarker.current) {
      destinationMarker.current.remove();
      destinationMarker.current = null;
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      if (!mapboxgl.supported()) {
        throw new Error('Your browser does not support Mapbox GL');
      }

      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-74.5, 40],
        zoom: 9,
      });

      newMap.on('load', () => {
        console.log('Map loaded successfully');
        setIsMapLoaded(true);
        map.current = newMap;
        toast({
          title: "Success",
          description: "Map initialized successfully",
        });
      });

      newMap.on('error', (e) => {
        console.error('Mapbox error:', e);
        toast({
          variant: "destructive",
          title: "Map Error",
          description: e.error.message || "An error occurred with the map",
        });
      });

      newMap.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      return () => {
        clearRouteAndMarkers();
        newMap.remove();
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
      sourceMarker.current = new mapboxgl.Marker({ color: '#FF0000' })
        .setLngLat([source.lng, source.lat])
        .addTo(map.current);
      
      map.current.flyTo({
        center: [source.lng, source.lat],
        zoom: 12
      });
    }

    // Update destination marker
    if (destination) {
      destinationMarker.current = new mapboxgl.Marker({ color: '#00FF00' })
        .setLngLat([destination.lng, destination.lat])
        .addTo(map.current);
    }

    // Calculate route if both markers are present
    if (source && destination) {
      calculateRoute(source, destination);
    }
  }, [source, destination]);

  const calculateRoute = async (src: Coordinates, dest: Coordinates) => {
    if (!map.current) return;

    try {
      console.log('Calculating route between:', src, dest);
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${src.lng},${src.lat};${dest.lng},${dest.lat}?geometries=geojson&access_token=${mapboxToken}`
      );

      const data = await response.json();

      if (!data.routes?.[0]) {
        throw new Error('No route found');
      }

      const routeFeature = {
        type: 'Feature',
        properties: {},
        geometry: data.routes[0].geometry
      } as GeoJSON.Feature<GeoJSON.LineString>;

      // Add the route to the map
      map.current.addSource('route', {
        type: 'geojson',
        data: routeFeature
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });

      setCurrentRoute(routeFeature);

      const coordinates = data.routes[0].geometry.coordinates;
      const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: number[]) => {
        return bounds.extend([coord[0], coord[1]]);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      map.current.fitBounds(bounds, {
        padding: 50
      });

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
          map={map.current}
          route={currentRoute}
          speed={speed}
          onSimulationEnd={onSimulationEnd}
        />
      )}
    </div>
  );
};

export default MapContainer;