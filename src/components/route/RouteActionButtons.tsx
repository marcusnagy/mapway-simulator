import { Button } from "@/components/ui/button";

interface RouteActionButtonsProps {
  routeStatus: "idle" | "crawling" | "querying" | "done";
  hasRoute: boolean;
  isSimulating: boolean;
  onReset: () => void;
  onCalculateRoute: () => void;
  onSimulate: () => void;
  onCancel: () => void;
  source: string;
  destination: string;
}

export function RouteActionButtons({
  routeStatus,
  hasRoute,
  isSimulating,
  onReset,
  onCalculateRoute,
  onSimulate,
  onCancel,
  source,
  destination,
}: RouteActionButtonsProps) {
  if (routeStatus === "crawling" || routeStatus === "querying") {
    return null;
  }

  return (
    <>
      <Button 
        onClick={onReset}
        variant="outline"
        className="bg-red-500/50 hover:bg-red-600/50 text-white border-none"
        disabled={isSimulating}
      >
        Reset
      </Button>
      
      {routeStatus === "idle" && (
        <Button 
          onClick={onCalculateRoute}
          className="bg-blue-500/50 hover:bg-blue-600/50 text-white"
          disabled={!source || !destination || isSimulating}
        >
          Calculate Route
        </Button>
      )}
      
      {hasRoute && (
        <Button 
          onClick={onSimulate}
          className="bg-green-500/50 hover:bg-green-600/50 text-white"
          disabled={isSimulating}
        >
          {isSimulating ? 'Simulating...' : 'Simulate'}
        </Button>
      )}

      {isSimulating && hasRoute && (
        <Button
          onClick={onCancel}  
          className="bg-red-500/50 hover:bg-red-600/50 text-white"
        >
          Cancel
        </Button>
      )}
    </>
  );
}