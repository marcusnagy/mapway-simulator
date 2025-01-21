import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Map from "@/components/Map";
import { useState } from "react";
import { Coordinates, POI } from "@/types/map";
import { ShinyText } from "@/components/mapui/ShinyText";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [speed, setSpeed] = useState("60");
  const [hasRoute, setHasRoute] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [mapSource, setMapSource] = useState<Coordinates | null>(null);
  const [mapDestination, setMapDestination] = useState<Coordinates | null>(null);
  const [isCanceled, setIsCanceled] = useState(false);
  const [routeStatus, setRouteStatus] = useState<"idle" | "crawling" | "querying" | "done">("idle");
  const [allPOIs, setAllPOIs] = useState<POI[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSimulate = () => {
    if (!mapSource || !mapDestination) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please set both source and destination coordinates.",
      });
      return;
    }
    console.log("Simulating route with speed:", speed);
    setIsSimulating(true);
  };

  const handleSimulationEnd = () => {
    setIsSimulating(false);
    setIsCanceled(false);
  };

  const handleReset = () => {
    setSource("");
    setDestination("");
    setSpeed("60");
    setRouteStatus("idle");
    setHasRoute(false);
    setIsSimulating(false);
    setMapSource(null);
    setMapDestination(null);
    setIsCanceled(false);
    setSelectedCategories([]);
    setAllPOIs([]);
    toast({
      title: "Reset Complete",
      description: "All values have been reset to their defaults.",
    });
  };

  const handleCalculateRoute = () => {
    if (!source || !destination) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both source and destination coordinates.",
      });
      return;
    }
    
    // Convert input coordinates to numbers
    const [sourceLng, sourceLat] = source.split(',').map(Number);
    const [destLng, destLat] = destination.split(',').map(Number);
    
    if (isNaN(sourceLng) || isNaN(sourceLat) || isNaN(destLng) || isNaN(destLat)) {
      toast({
        variant: "destructive",
        title: "Invalid Format",
        description: "Please enter coordinates in the format: longitude,latitude",
      });
      return;
    }

    setRouteStatus("crawling");
    setMapSource({ lng: sourceLng, lat: sourceLat });
    setMapDestination({ lng: destLng, lat: destLat });
  };

  const handleCancel = () => {
    setIsCanceled(true);
    toast({
      title: "Simulation Canceled",
      description: "The route simulation has been canceled.",
    });
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute top-4 right-4 z-10">
        <CategoryFilter
          allCategories={[...new Set(allPOIs.flatMap(p => p.categories ?? []))]}
          selectedCategories={selectedCategories}
          onChangeSelected={(cats) => setSelectedCategories(cats)}
        />
      </div>
      
      <Map 
        source={mapSource}
        destination={mapDestination}
        speed={Number(speed)}
        isSimulating={isSimulating}
        isCanceled={isCanceled}
        setRouteStatus={setRouteStatus}
        setSource={setSource}
        setMapSource={setMapSource}
        onRouteCalculated={() => setHasRoute(true)}
        onSimulationEnd={handleSimulationEnd}
        allPOIs={allPOIs}
        setAllPOIs={setAllPOIs}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />
      
      {/* Collapsible Controls Panel */}
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

      {/* Bottom Right Controls */}
      <div className="absolute bottom-4 right-4 space-x-4">
        {routeStatus === "crawling" && (
          <ShinyText
            text="Crawling..."
            speed={1.5}
            className="text-xl"
          />
        )}

        {routeStatus === "querying" && (
          <ShinyText
            text="Querying POIs..."
            speed={1.5}
            className="text-xl"
          />
        )}

        {routeStatus !== "crawling" && routeStatus !== "querying" && (
          <>
            <Button 
              onClick={handleReset}
              variant="outline"
              className="bg-red-500/50 hover:bg-red-600/50 text-white border-none"
              disabled={isSimulating}
            >
              Reset
            </Button>
            {routeStatus === "idle" && (
              <Button 
                onClick={handleCalculateRoute}
                className="bg-blue-500/50 hover:bg-blue-600/50 text-white"
                disabled={!source || !destination || isSimulating}
              >
                Calculate Route
              </Button>
            )}
            
            {hasRoute && (
              <Button 
                onClick={handleSimulate}
                className="bg-green-500/50 hover:bg-green-600/50 text-white"
                disabled={isSimulating}
              >
                {isSimulating ? 'Simulating...' : 'Simulate'}
              </Button>
            )}

            {isSimulating && hasRoute && (
              <Button
                onClick={handleCancel}  
                className="bg-red-500/50 hover:bg-red-600/50 text-white"
              >
                Cancel
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;