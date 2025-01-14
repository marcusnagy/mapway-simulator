import { useState } from 'react';
import { Coordinates } from '@/types/map';
import MapTokenInput from './map/MapTokenInput';
import RouteControls from './map/RouteControls';
import MapContainer from './map/MapContainer';

interface MapProps {
  source: Coordinates | null;
  destination: Coordinates | null;
  onRouteCalculated: () => void;
}

const Map = ({ source, destination, onRouteCalculated }: MapProps) => {
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

  return (
    <div className="fixed inset-0">
      <MapContainer
        mapboxToken={mapboxToken}
        source={source}
        destination={destination}
        onRouteCalculated={onRouteCalculated}
        setIsMapLoaded={setIsMapLoaded}
      />
    </div>
  );
};

export default Map;