import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface MapTokenInputProps {
  mapboxToken: string;
  setMapboxToken: (token: string) => void;
  setIsMapInitialized: (initialized: boolean) => void;
}

const MapTokenInput = ({ mapboxToken, setMapboxToken, setIsMapInitialized }: MapTokenInputProps) => {
  const [token, setToken] = useState(mapboxToken);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid Mapbox token",
      });
      return;
    }
    setMapboxToken(token);
    setIsMapInitialized(true);
  };

  return (
    <form onSubmit={handleSubmit} className="w-96 space-y-4 bg-black/50 backdrop-blur-sm p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-white">Enter Mapbox Token</h2>
      <Input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter your Mapbox token"
        className="bg-gray-900/50 border-gray-700 text-white"
      />
      <Button type="submit" className="w-full">
        Initialize Map
      </Button>
    </form>
  );
};

export default MapTokenInput;