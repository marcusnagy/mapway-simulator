import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coordinates } from "@/types/map";

interface RouteControlsProps {
  source: string;
  destination: string;
  speed: string;
  setSource: (source: string) => void;
  setDestination: (destination: string) => void;
  setSpeed: (speed: string) => void;
  hasRoute: boolean;
  onCalculateRoute: () => void;
  onSimulate: () => void;
  onReset: () => void;
}

const RouteControls = ({
  source,
  destination,
  speed,
  setSource,
  setDestination,
  setSpeed,
  hasRoute,
  onCalculateRoute,
  onSimulate,
  onReset
}: RouteControlsProps) => {
  return (
    <>
      <div className="absolute top-4 left-4 p-6 bg-black/50 backdrop-blur-sm rounded-lg w-96 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="source" className="text-white">Source Location (lng,lat)</Label>
          <Input
            id="source"
            placeholder="e.g., -74.5,40.5"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="bg-gray-900/50 border-gray-700 text-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="destination" className="text-white">Destination (lng,lat)</Label>
          <Input
            id="destination"
            placeholder="e.g., -74.6,40.6"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="bg-gray-900/50 border-gray-700 text-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="speed" className="text-white">Speed (km/h)</Label>
          <Input
            id="speed"
            type="number"
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            min="1"
            max="200"
            className="bg-gray-900/50 border-gray-700 text-white"
          />
        </div>
      </div>

      <div className="absolute bottom-4 right-4 space-x-4">
        <Button 
          onClick={onReset}
          variant="outline"
          className="bg-red-500/50 hover:bg-red-600/50 text-white border-none"
        >
          Reset
        </Button>
        
        <Button 
          onClick={onCalculateRoute}
          className="bg-blue-500/50 hover:bg-blue-600/50 text-white"
          disabled={!source || !destination}
        >
          Calculate Route
        </Button>
        
        {hasRoute && (
          <Button 
            onClick={onSimulate}
            className="bg-green-500/50 hover:bg-green-600/50 text-white"
          >
            Simulate
          </Button>
        )}
      </div>
    </>
  );
};

export default RouteControls;