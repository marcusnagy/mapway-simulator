import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle, Search, SearchCheck } from "lucide-react";
import { ShinyText } from "../mapui/ShinyText";

interface CrawlControlsProps {
  isCrawling: boolean;
  isQuerying: boolean;
  crawlDone: boolean;
  queryDone: boolean;
  onCrawl: (maxPlaces: number) => void;
  maxPlaces: number;
  setMaxPlaces: (value: number) => void;
  children?: React.ReactNode;
}

const CrawlControls = ({
  isCrawling,
  isQuerying,
  crawlDone,
  queryDone,
  onCrawl,
  maxPlaces,
  setMaxPlaces,
}: CrawlControlsProps) => {
  return (
    <div className="flex flex-col space-y-2">
      {isQuerying ? (
        <div className="text-sm text-gray-400">
          <ShinyText text="Querying POIs..." speed={1.5} />
        </div>
      ) : queryDone ? (
        <div className="flex items-center text-sm text-green-400">
          <SearchCheck className="h-4 w-4 mr-2" />
          <ShinyText text="Query Done" speed={1.5} />
        </div>
      ) : (null)}
      
      <div className="flex flex-row gap-2">
        <div className="flex flex-col">
          <Label htmlFor="maxPlaces" className="text-white text-xs mb-1">Max Places</Label>
          <Input
            id="maxPlaces"
            type="number"
            min="1"
            max="999999"
            value={maxPlaces}
            onChange={(e) => setMaxPlaces(Number(e.target.value))}
            className="bg-gray-900/50 border-gray-700 text-white h-8 w-24"
          />
        </div>
        <div className="flex items-end">
            <Button
            onClick={() => onCrawl(maxPlaces)}
            disabled={isCrawling}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white h-8 flex items-center justify-center"
            >
            {isCrawling ? (
              <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              <ShinyText text="Crawling..." speed={1.5} />
              </>
            ) : crawlDone ? (
              <>
                <SearchCheck className="mr-2 h-4 w-4" />
              <ShinyText text="Crawl Done" speed={1.5} />
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
              <ShinyText text="Crawl Places" speed={1.5} />
              </>
            )}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default CrawlControls;