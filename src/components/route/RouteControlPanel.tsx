import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RouteControlPanelProps {
  source: string;
  destination: string;
  speed: string;
  isSimulating: boolean;
  setSource: (source: string) => void;
  setDestination: (destination: string) => void;
  setSpeed: (speed: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function RouteControlPanel({
  source,
  destination,
  speed,
  isSimulating,
  setSource,
  setDestination,
  setSpeed,
  isOpen,
  setIsOpen,
}: RouteControlPanelProps) {
  return (
    <div className="absolute top-4 left-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-96">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="mb-2 w-full flex items-center justify-between bg-black/50 backdrop-blur-sm text-white border-gray-700 hover:bg-black/60">
            Route Configuration
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-6 bg-black/50 backdrop-blur-sm rounded-lg space-y-4">
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
              disabled={isSimulating}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}