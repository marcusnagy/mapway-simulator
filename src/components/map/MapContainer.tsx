import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Coordinates, POI } from '@/types/map';
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-74.5, 40],
      zoom: 9
    });

    map.current.on('load', () => {
      setIsMapLoaded(true);
      toast({
        title: "Map Loaded",
        description: "The map has been initialized successfully.",
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default MapContainer;