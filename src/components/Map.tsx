import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coordinates, RoutePoint, POI } from '@/types/map';
import { useToast } from "@/hooks/use-toast";

const POI_ICON = {
  'restaurant': '🍽️',
  'park': '🌳',
  'shop': '🛍️',
  'default': '📍'
};

interface MapProps {
  onSourceSet: (coords: Coordinates) => void;
  onDestinationSet: (coords: Coordinates) => void;
  onRouteCalculated: () => void;
}

const Map = ({ onSourceSet, onDestinationSet, onRouteCalculated }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [pois, setPois] = useState<POI[]>([]);
  const [newPoiName, setNewPoiName] = useState('');
  const [newPoiType, setNewPoiType] = useState<string>('default');
  const [sourceMarker, setSourceMarker] = useState<mapboxgl.Marker | null>(null);
  const [destinationMarker, setDestinationMarker] = useState<mapboxgl.Marker | null>(null);
  const [source, setSource] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const { toast } = useToast();

  const addPOIToMap = (poi: POI) => {
    if (!map.current || !isMapLoaded) return;

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
    if (!map.current || !isMapLoaded) return;

    const coordinates: Coordinates = {
      lng: e.lngLat.lng,
      lat: e.lngLat.lat
    };

    if (!source) {
      // Set source marker
      if (sourceMarker) sourceMarker.remove();
      const newMarker = new mapboxgl.Marker({ color: '#FF0000' })
        .setLngLat([coordinates.lng, coordinates.lat])
        .addTo(map.current);
      setSourceMarker(newMarker);
      setSource(coordinates);
      onSourceSet(coordinates);
      toast({
        title: "Source set",
        description: "Click on the map to set destination",
      });
    } else if (!destination) {
      // Set destination marker
      if (destinationMarker) destinationMarker.remove();
      const newMarker = new mapboxgl.Marker({ color: '#00FF00' })
        .setLngLat([coordinates.lng, coordinates.lat])
        .addTo(map.current);
      setDestinationMarker(newMarker);
      setDestination(coordinates);
      onDestinationSet(coordinates);
      toast({
        title: "Destination set",
        description: "Click Calculate Route to see the path",
      });
    }

    // Handle POI creation if name is set
    if (newPoiName) {
      const newPoi: POI = {
        id: Date.now().toString(),
        name: newPoiName,
        type: newPoiType,
        coordinates
      };

      setPois(prev => [...prev, newPoi]);
      addPOIToMap(newPoi);
      setNewPoiName('');
    }
  };

  const calculateRoute = async () => {
    if (!map.current || !source || !destination) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}?geometries=geojson&access_token=${mapboxToken}`
      );

      const data = await response.json();

      if (!data.routes?.[0]) {
        throw new Error('No route found');
      }

      // Remove existing route layer if it exists
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
      }
      if (map.current.getSource('route')) {
        map.current.removeSource('route');
      }

      // Add the route to the map
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

      // Fit the map to the route
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
      console.log('Initializing map with container and token...');
      
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

        // Only add click handler after map is loaded
        newMap.on('load', () => {
          newMap.on('click', handleMapClick);
          // Add existing POIs after map is loaded
          pois.forEach(poi => addPOIToMap(poi));
        });

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
      <div className="p-4 space-y-4 border border-gray-700 rounded-lg bg-gray-900">
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
            disabled={!isMapLoaded}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="poi-type">POI Type</Label>
          <Select 
            value={newPoiType} 
            onValueChange={setNewPoiType}
            disabled={!isMapLoaded}
          >
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
        {source && destination && (
          <Button 
            onClick={calculateRoute}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Calculate Route
          </Button>
        )}
      </div>
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
        <div ref={mapContainer} className="absolute inset-0" />
        {!isMapLoaded && isMapInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <div className="text-white">Loading map...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;