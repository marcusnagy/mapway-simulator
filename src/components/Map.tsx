import { useEffect, useState } from 'react';
import { Coordinates } from '@/types/map';
import MapTokenInput from './map/MapTokenInput';
import MapContainer from './map/MapContainer';

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
  onSimulationEnd 
}: MapProps) => {
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapboxToken && !isMapLoaded) return;

    async function fetchIPLocation() {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        setSource(`${data.longitude},${data.latitude}`);
        // data should have latitude/longitude
        setMapSource({ lat: data.latitude, lng: data.longitude });
      } catch (e) {
        console.error('Error fetching IP location:', e);
      }
    }
    fetchIPLocation();
  }, [mapboxToken]);

  if (!isMapInitialized) {
    return (
      <MapTokenInput
        mapboxToken={mapboxToken}
        setMapboxToken={setMapboxToken}
        setIsMapInitialized={setIsMapInitialized}
      />
    );
  }

  if (!mapboxToken) {
    return <div>Please enter a Mapbox token</div>;
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
      />
    </div>
  );
};

export default Map;