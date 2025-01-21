import { useState } from "react";
import { Coordinates, POI } from "@/types/map";
import Map from "@/components/Map";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useToast } from "@/hooks/use-toast";
import { RouteControlPanel } from "@/components/route/RouteControlPanel";
import { RouteStatus } from "@/components/route/RouteStatus";
import { RouteActionButtons } from "@/components/route/RouteActionButtons";

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
      
      <RouteControlPanel
        source={source}
        destination={destination}
        speed={speed}
        isSimulating={isSimulating}
        setSource={setSource}
        setDestination={setDestination}
        setSpeed={setSpeed}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <div className="absolute bottom-4 right-4 space-x-4">
        <RouteStatus status={routeStatus} />
        <RouteActionButtons
          routeStatus={routeStatus}
          hasRoute={hasRoute}
          isSimulating={isSimulating}
          onReset={handleReset}
          onCalculateRoute={handleCalculateRoute}
          onSimulate={handleSimulate}
          onCancel={handleCancel}
          source={source}
          destination={destination}
        />
      </div>
    </div>
  );
};

export default Index;