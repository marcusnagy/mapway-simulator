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
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
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
    
    toast({
      title: "POI Added",
      description: `Added ${newPoi.name} at coordinates (${newPoi.coordinates.lng.toFixed(4)}, ${newPoi.coordinates.lat.toFixed(4)})`,
    });
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-74.5, 40],
        zoom: 9,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Add click handler for adding POIs
      map.current.on('click', handleMapClick);

      // Add existing POIs to map
      pois.forEach(poi => addPOIToMap(poi));

      setIsMapInitialized(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initialize map. Please check your Mapbox token.",
      });
    }
  };

  // Add new POI when they're added to the state
  useEffect(() => {
    if (map.current) {
      pois.forEach(poi => addPOIToMap(poi));
    }
  }, [pois]);

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