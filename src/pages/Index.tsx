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
    <div className="min-h-screen bg-black p-4">
      <div className="container mx-auto space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-6">
            <div className="flex gap-6 items-end">
              <div className="space-y-2 flex-1">
                <Label htmlFor="source" className="text-gray-300">Source Location</Label>
                <Input
                  id="source"
                  placeholder="Enter source location"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="glow-input bg-gray-900 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2 flex-1">
                <Label htmlFor="destination" className="text-gray-300">Destination</Label>
                <Input
                  id="destination"
                  placeholder="Enter destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="glow-input bg-gray-900 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2 flex-1">
                <Label htmlFor="speed" className="text-gray-300">Speed (km/h)</Label>
                <Input
                  id="speed"
                  type="number"
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  min="1"
                  max="200"
                  className="glow-input bg-gray-900 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                onClick={handleSimulate}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Simulation
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Reset
              </Button>
            </div>
          </div>
          
          <div className="h-[600px]">
            <Map />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;