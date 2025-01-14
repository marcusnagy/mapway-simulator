import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      // Initialize map
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11', // Dark style for GTA-like appearance
        center: [-74.5, 40], // Default center
        zoom: 9,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      setIsMapInitialized(true);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (!isMapInitialized) {
    return (
      <div className="p-4 space-y-4 border rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="mapbox-token">Mapbox Access Token</Label>
          <Input
            id="mapbox-token"
            placeholder="Enter your Mapbox public access token"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Get your token from <a href="https://www.mapbox.com/account/access-tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mapbox Dashboard</a>
          </p>
        </div>
        <Button onClick={initializeMap} disabled={!mapboxToken}>
          Initialize Map
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;