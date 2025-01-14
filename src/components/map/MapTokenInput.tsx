import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MapTokenInputProps {
  mapboxToken: string;
  setMapboxToken: (token: string) => void;
  setIsMapInitialized: (initialized: boolean) => void;
}

const MapTokenInput = ({ mapboxToken, setMapboxToken, setIsMapInitialized }: MapTokenInputProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
      <div className="p-6 space-y-4 bg-gray-900 rounded-lg border border-gray-700 max-w-md w-full mx-4">
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Initialize Map
        </Button>
      </div>
    </div>
  );
};

export default MapTokenInput;