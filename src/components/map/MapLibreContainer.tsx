import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { latLngToCell } from 'h3-js';
import { darkMapStyle, poiLayerStyle, poiLabelsStyle } from '@/styles/mapStyle';
import { Coordinates, POI } from '@/types/map';
import { useToast } from "@/hooks/use-toast";

interface MapLibreContainerProps {
  mapboxToken: string;
  source: Coordinates | null;
  destination: Coordinates | null;
  onMapLoaded: () => void;
  allPOIs: POI[];
  selectedCategories: string[];
}

const MapLibreContainer = ({
  mapboxToken,
  source,
  destination,
  onMapLoaded,
  allPOIs,
  selectedCategories
}: MapLibreContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: darkMapStyle,
        center: [0, 0],
        zoom: 2,
        maxZoom: 18
      });

      map.current.on('load', () => {
        onMapLoaded();
        toast({
          title: "Success",
          description: "Map initialized successfully",
        });
      });

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initialize map",
      });
    }
  }, []);

  // Update POIs when they change
  useEffect(() => {
    if (!map.current || !allPOIs.length) return;

    const filteredPOIs = allPOIs.filter(poi => 
      poi.categories?.some(cat => selectedCategories.includes(cat))
    );

    const features = filteredPOIs.map(poi => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [poi.locationLng, poi.locationLat]
      },
      properties: {
        id: poi.placeId,
        title: poi.title,
        h3Index: poi.h3Index,
        ...poi
      }
    }));

    const source = map.current.getSource('pois');
    
    if (source) {
      (source as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features
      });
    } else {
      map.current.addSource('pois', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      map.current.addLayer(poiLayerStyle);
      map.current.addLayer(poiLabelsStyle);
    }
  }, [allPOIs, selectedCategories]);

  return (
    <div ref={mapContainer} className="absolute inset-0" />
  );
};

export default MapLibreContainer;