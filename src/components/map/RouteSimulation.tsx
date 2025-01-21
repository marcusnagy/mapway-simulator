import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Coordinates } from '@/types/map';
import 'mapbox-gl/dist/mapbox-gl.css'; // Import Mapbox CSS needed for the markers.

interface RouteSimulationProps {
  map: mapboxgl.Map;
  route: GeoJSON.Feature<GeoJSON.LineString>;
  speed: number; // km/h
  onSimulationEnd: () => void;
  isCanceled: boolean;
  onStepChange: (step: number, route: GeoJSON.Feature<GeoJSON.LineString>) => void;
  onComplete?: () => void;
  children?: React.ReactNode;
}

const RouteSimulation = ({
  map,
  route,
  speed,
  onSimulationEnd,
  isCanceled,
  onStepChange,
  onComplete,
  }: RouteSimulationProps) => {
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!map || !route) return;

    // Create a custom element for the marker
    const markerEl = document.createElement('div');
    markerEl.style.fontSize = '24px';
    markerEl.textContent = '🚗';

    // Create a moving marker
    const marker = new mapboxgl.Marker({ element: markerEl });
    markerRef.current = marker;

    // Get route coordinates
    const coordinates = route.geometry.coordinates;
    const steps = coordinates.length;
    if (steps < 2) {
      console.log("Route has fewer than 2 coordinates, cannot animate.");
      return;
    }

    let currentStep = 0;

    // Calculate total distance
    const totalDistance = coordinates.reduce((acc, coord, i) => {
      if (i === 0) return 0;
      const prevCoord = coordinates[i - 1];
      return acc + calculateDistance(
        { lng: prevCoord[0], lat: prevCoord[1] },
        { lng: coord[0], lat: coord[1] }
      );
    }, 0);

    // Calculate timing
    const totalTimeMs = (totalDistance / speed) * 3600000; // km/h -> ms
    const stepTimeMs = (totalTimeMs / steps) * 0.1; // Speed up by 10x
    console.log("Steps:", steps, "Total distance:", totalDistance, "stepTimeMs:", stepTimeMs);

    const animate = () => {
      if (!markerRef.current) return;
      if (isCanceled) {
        markerRef.current.remove();
        onSimulationEnd();
        if (onComplete) onComplete();
        return;
      }

      if (currentStep >= steps) {
        markerRef.current.remove();
        onSimulationEnd();
        if (onComplete) onComplete();
        return;
      }

      if (onStepChange) {
        onStepChange(currentStep, route);
      }

      const coord = coordinates[currentStep];
      markerRef.current.setLngLat([coord[0], coord[1]]);

      if (currentStep === 0) {
        // Place the marker on first coordinate
        markerRef.current.addTo(map);
      }

      console.log(`Animating step ${currentStep + 1}/${steps}`);
      currentStep++;
      animationRef.current = window.setTimeout(() => {
        requestAnimationFrame(animate);
      }, stepTimeMs);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
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
  const dLat = toRad(point2.lat - point1.lat); // Difference in latitude
  const dLon = toRad(point2.lng - point1.lng); // Difference in longitude
  const lat1 = toRad(point1.lat); // Latitude of point1 in radians
  const lat2 = toRad(point2.lat); // Latitude of point2 in radians

  // Haversine formula
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

// Convert degrees to radians
const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

export default RouteSimulation;