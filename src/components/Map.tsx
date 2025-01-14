import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from "@/hooks/use-toast";
import { Coordinates } from '@/types/map';

interface MapProps {
  source: Coordinates | null;
  destination: Coordinates | null;
  onRouteCalculated: () => void;
}

const Map = ({ source, destination, onRouteCalculated }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [sourceMarker, setSourceMarker] = useState<mapboxgl.Marker | null>(null);
  const [destinationMarker, setDestinationMarker] = useState<mapboxgl.Marker | null>(null);
  const { toast } = useToast();

  // Update markers when coordinates change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Update source marker
    if (source) {
      if (sourceMarker) sourceMarker.remove();
      const newMarker = new mapboxgl.Marker({ color: '#FF0000' })
        .setLngLat([source.lng, source.lat])
        .addTo(map.current);
      setSourceMarker(newMarker);
      
      // Center map on source
      map.current.flyTo({
        center: [source.lng, source.lat],
        zoom: 12
      });
    }

    // Update destination marker
    if (destination) {
      if (destinationMarker) destinationMarker.remove();
      const newMarker = new mapboxgl.Marker({ color: '#00FF00' })
        .setLngLat([destination.lng, destination.lat])
        .addTo(map.current);
      setDestinationMarker(newMarker);
    }

    // Calculate route if both markers are present
    if (source && destination) {
      calculateRoute(source, destination);
    }
  }, [source, destination]);

  const calculateRoute = async (src: Coordinates, dest: Coordinates) => {
    if (!map.current) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${src.lng},${src.lat};${dest.lng},${dest.lat}?geometries=geojson&access_token=${mapboxToken}`
      );

      const data = await response.json();

      if (!data.routes?.[0]) {
        throw new Error('No route found');
      }

      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
      }
      if (map.current.getSource('route')) {
        map.current.removeSource('route');
      }

      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: data.routes[0].geometry
        }
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

  useEffect(() => {
    if (isMapInitialized && mapContainer.current && mapboxToken && !map.current) {
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

        map.current = newMap;

      } catch (error) {
        console.error('Error initializing map:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to initialize map",
        });
        setIsMapInitialized(false);
        setIsMapLoaded(false);
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setIsMapLoaded(false);
      }
    };
  }, [isMapInitialized, mapboxToken]);

  if (!isMapInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
        <div className="p-6 space-y-4 bg-gray-900 rounded-lg border border-gray-700 max-w-md w-full mx-4">
          <div className="space-y-2">
            <Label htmlFor="mapbox-token" className="text-gray-300">Mapbox Access Token</Label>
            <Input
              id="mapbox-token"
              placeholder="Enter your Mapbox public access token (pk.*)"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <p className="text-sm text-gray-400">
              Get your token from <a href="https://www.mapbox.com/account/access-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Mapbox Dashboard</a>
            </p>
          </div>
          <Button 
            onClick={() => setIsMapInitialized(true)} 
            disabled={!mapboxToken || !mapboxToken.startsWith('pk.')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Initialize Map
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;