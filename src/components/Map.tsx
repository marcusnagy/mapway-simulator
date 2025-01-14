import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coordinates, RoutePoint, POI } from '@/types/map';
import { useToast } from "@/components/ui/use-toast";

const POI_ICON = {
  'restaurant': '🍽️',
  'park': '🌳',
  'shop': '🛍️',
  'default': '📍'
};

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [pois, setPois] = useState<POI[]>([]);
  const [newPoiName, setNewPoiName] = useState('');
  const [newPoiType, setNewPoiType] = useState<string>('default');
  const { toast } = useToast();

  const addPOIToMap = (poi: POI) => {
    if (!map.current) return;

    const el = document.createElement('div');
    el.className = 'poi-marker';
    el.innerHTML = POI_ICON[poi.type as keyof typeof POI_ICON] || POI_ICON.default;
    el.style.fontSize = '24px';
    el.style.cursor = 'pointer';

    new mapboxgl.Marker(el)
      .setLngLat([poi.coordinates.lng, poi.coordinates.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>${poi.name}</h3>`))
      .addTo(map.current);
  };

  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    if (!newPoiName) return;

    const newPoi: POI = {
      id: Date.now().toString(),
      name: newPoiName,
      type: newPoiType,
      coordinates: {
        lng: e.lngLat.lng,
        lat: e.lngLat.lat
      }
    };

    setPois(prev => [...prev, newPoi]);
    addPOIToMap(newPoi);
    setNewPoiName('');
  };

  useEffect(() => {
    if (isMapInitialized && mapContainer.current && mapboxToken && !map.current) {
      console.log('Initializing map with container and token...');
      
      try {
        mapboxgl.accessToken = mapboxToken;
        
        if (!mapboxgl.supported()) {
          throw new Error('Your browser does not support Mapbox GL');
        }

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [-74.5, 40],
          zoom: 9,
        });

        map.current.on('load', () => {
          console.log('Map loaded successfully');
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

        map.current.addControl(
          new mapboxgl.NavigationControl(),
          'top-right'
        );

        map.current.on('click', handleMapClick);
        pois.forEach(poi => addPOIToMap(poi));

      } catch (error) {
        console.error('Error initializing map:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to initialize map",
        });
        setIsMapInitialized(false);
      }
    }
  }, [isMapInitialized, mapboxToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (!isMapInitialized) {
    return (
      <div className="p-4 space-y-4 border border-gray-700 rounded-lg bg-gray-900">
        <div className="space-y-2">
          <Label htmlFor="mapbox-token" className="text-gray-300">Mapbox Access Token</Label>
          <Input
            id="mapbox-token"
            placeholder="Enter your Mapbox public access token"
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
          disabled={!mapboxToken}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Initialize Map
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end">
        <div className="space-y-2 flex-1">
          <Label htmlFor="poi-name">POI Name</Label>
          <Input
            id="poi-name"
            placeholder="Enter POI name"
            value={newPoiName}
            onChange={(e) => setNewPoiName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="poi-type">POI Type</Label>
          <Select value={newPoiType} onValueChange={setNewPoiType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="park">Park</SelectItem>
              <SelectItem value="shop">Shop</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
    </div>
  );
};

export default Map;