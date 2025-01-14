import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Coordinates } from '@/types/map';

interface RouteSimulationProps {
  map: mapboxgl.Map;
  route: GeoJSON.Feature<GeoJSON.LineString>;
  speed: number; // km/h
  onSimulationEnd: () => void;
}

const RouteSimulation = ({ map, route, speed, onSimulationEnd }: RouteSimulationProps) => {
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!map || !route) return;

    // Create a moving marker
    const marker = new mapboxgl.Marker({
      color: '#FFA500',
    });
    markerRef.current = marker;

    // Get route coordinates
    const coordinates = route.geometry.coordinates;
    const steps = coordinates.length;
    let currentStep = 0;

    // Calculate total distance in kilometers
    const totalDistance = coordinates.reduce((acc, coord, i) => {
      if (i === 0) return 0;
      const prevCoord = coordinates[i - 1];
      const distance = calculateDistance(
        { lng: prevCoord[0], lat: prevCoord[1] },
        { lng: coord[0], lat: coord[1] }
      );
      return acc + distance;
    }, 0);

    // Calculate time needed for entire route based on speed (km/h)
    const totalTimeHours = totalDistance / speed;
    const totalTimeMs = totalTimeHours * 3600000; // Convert hours to milliseconds
    const stepTimeMs = totalTimeMs / steps;

    const animate = (timestamp: number) => {
      if (!markerRef.current) return;

      if (currentStep >= steps) {
        if (markerRef.current) {
          markerRef.current.remove();
        }
        onSimulationEnd();
        return;
      }

      const coord = coordinates[currentStep];
      markerRef.current.setLngLat([coord[0], coord[1]]);
      
      if (currentStep === 0) {
        markerRef.current.addTo(map);
      }

      currentStep++;
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [map, route, speed, onSimulationEnd]);

  return null;
};

// Calculate distance between two points in kilometers using the Haversine formula
const calculateDistance = (point1: Coordinates, point2: Coordinates): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

export default RouteSimulation;