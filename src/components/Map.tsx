import { useState } from 'react';
import { Coordinates } from '@/types/map';
import MapTokenInput from './map/MapTokenInput';
import MapContainer from './map/MapContainer';

interface MapProps {
  source: Coordinates | null;
  destination: Coordinates | null;
  speed: number;
  isSimulating: boolean;
  onRouteCalculated: () => void;
  onSimulationEnd: () => void;
}

const Map = ({ 
  source, 
  destination, 
  speed,
  isSimulating,
  onRouteCalculated,
  onSimulationEnd 
}: MapProps) => {
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

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
        onRouteCalculated={onRouteCalculated}
        onSimulationEnd={onSimulationEnd}
        setIsMapLoaded={setIsMapLoaded}
      />
    </div>
  );
};

export default Map;