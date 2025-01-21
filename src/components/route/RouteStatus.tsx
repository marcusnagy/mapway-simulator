import { ShinyText } from "@/components/mapui/ShinyText";

interface RouteStatusProps {
  status: "idle" | "crawling" | "querying" | "done";
}

export function RouteStatus({ status }: RouteStatusProps) {
  if (status === "crawling") {
    return (
      <ShinyText
        text="Crawling..."
        speed={1.5}
        className="text-xl"
      />
    );
  }

  if (status === "querying") {
    return (
      <ShinyText
        text="Querying POIs..."
        speed={1.5}
        className="text-xl"
      />
    );
  }

  return null;
}