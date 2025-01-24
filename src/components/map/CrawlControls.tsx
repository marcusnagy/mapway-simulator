import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { ShinyText } from "../mapui/ShinyText";

interface CrawlControlsProps {
  isCrawling: boolean;
  isQuerying: boolean;
  onCrawl: (maxPlaces: number) => void;
  maxPlaces: number;
  setMaxPlaces: (value: number) => void;
}

const CrawlControls = ({
  isCrawling,
  isQuerying,
  onCrawl,
  maxPlaces,
  setMaxPlaces,
}: CrawlControlsProps) => {
  return (
    <div className="flex flex-col space-y-2">
      {isQuerying && (
        <div className="text-sm text-gray-400">
          <ShinyText text="Querying POIs..." speed={1.5} />
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <Label htmlFor="maxPlaces" className="text-white text-xs mb-1">Max Places</Label>
          <Input
            id="maxPlaces"
            type="number"
            min="1"
            max="10"
            value={maxPlaces}
            onChange={(e) => setMaxPlaces(Number(e.target.value))}
            className="bg-gray-900/50 border-gray-700 text-white h-8 w-24"
          />
        </div>
        <div className="flex items-end">
          <Button
            onClick={() => onCrawl(maxPlaces)}
            disabled={isCrawling}
            className="bg-purple-500/50 hover:bg-purple-600/50 text-white h-8"
          >
            {isCrawling ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Crawling...
              </>
            ) : (
              'Crawl Places'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CrawlControls;