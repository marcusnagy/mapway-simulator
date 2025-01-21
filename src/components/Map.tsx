import { useEffect, useState } from 'react';
import { Coordinates, POI } from '@/types/map';
import MapTokenInput from './map/MapTokenInput';
import MapContainer from './map/MapContainer';
import Squares from './Squares';

interface MapProps {
  source: Coordinates | null;
  destination: Coordinates | null;
  speed: number;
  isSimulating: boolean;
  isCanceled: boolean;
  setRouteStatus: React.Dispatch<React.SetStateAction<"idle" | "crawling" | "querying" | "done">>;
  setSource: (source: string) => void;
  setMapSource: (source: Coordinates) => void;
  onRouteCalculated: () => void;
  onSimulationEnd: () => void;
  allPOIs: POI[];
  setAllPOIs: React.Dispatch<React.SetStateAction<POI[]>>;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const Map = ({ 
  source, 
  destination, 
  speed,
  isSimulating,
  isCanceled,
  setRouteStatus,
  setSource,
  setMapSource,
  onRouteCalculated,
  onSimulationEnd,
  allPOIs,
  setAllPOIs,
  selectedCategories,
  setSelectedCategories,
}: MapProps) => {
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapboxToken || !isMapLoaded) return;

    async function fetchIPLocation() {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        setSource(`${data.longitude},${data.latitude}`);
        setMapSource({ lat: data.latitude, lng: data.longitude });
      } catch (e) {
        console.error('Error fetching IP location:', e);
      }
    }
    fetchIPLocation();
  }, [mapboxToken, isMapLoaded]);

  if (!isMapInitialized) {
    return (
      <div className="relative w-full h-screen">
        <Squares />
        <div className="absolute inset-0 flex items-center justify-center">
          <MapTokenInput
            mapboxToken={mapboxToken}
            setMapboxToken={setMapboxToken}
            setIsMapInitialized={setIsMapInitialized}
          />
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="relative w-full h-screen">
        <Squares />
        <div className="absolute inset-0 flex items-center justify-center">
          Please enter a Mapbox token
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0">
      <MapContainer
        mapboxToken={mapboxToken}
        source={source}
        destination={destination}
        speed={speed}
        isSimulating={isSimulating}
        isCanceled={isCanceled}
        setRouteStatus={setRouteStatus}
        onRouteCalculated={onRouteCalculated}
        onSimulationEnd={onSimulationEnd}
        setIsMapLoaded={setIsMapLoaded}
        allPOIs={allPOIs}
        setAllPOIs={setAllPOIs}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />
    </div>
  );
};

export default Map;