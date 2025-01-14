import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Map from "@/components/Map";
import { useState } from "react";

const Index = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [speed, setSpeed] = useState("60");

  const handleSimulate = () => {
    // Will implement simulation logic later
    console.log("Simulating route with speed:", speed);
  };

  const handleReset = () => {
    setSource("");
    setDestination("");
    setSpeed("60");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source Location</Label>
              <Input
                id="source"
                placeholder="Enter source location"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="Enter destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="speed">Speed (km/h)</Label>
              <Input
                id="speed"
                type="number"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                min="1"
                max="200"
              />
            </div>

            <div className="space-x-4">
              <Button onClick={handleSimulate}>Start Simulation</Button>
              <Button variant="outline" onClick={handleReset}>Reset</Button>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2 h-[600px]">
            <Map />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;