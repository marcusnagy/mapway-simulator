import { createRoot } from "react-dom/client";
import { HoverCard, HoverCardTrigger, HoverCardContent} from "@/components/ui/hover-card";
import DecryptedText from "@/components/mapui/DecryptedText";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import {Histogram, StarRating} from "@/components/mapui/Poi";
import { Button } from "@/components/ui/button";
import { POI } from "@/types/map";
import { Globe, MapPin, Phone } from "lucide-react";

interface HoverCardMarkerProps {
    poi: POI;
    children?: React.ReactNode;
}

const HoverCardMarker: React.FC<HoverCardMarkerProps> = ({ poi }) => {
  const { title, address, phone, website, totalScore = 0, openingHours, description, popularTimesHistogram } = poi;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundSize: "cover",
            cursor: "pointer",
            backgroundColor: "transparent",
            backgroundImage: poi.imageUrl
              ? `url(${poi.imageUrl})`
              : "url('https://img.icons8.com/?size=512&id=JnKur3Cocs7X&format=png&color=FD7E14')",
          }}
        />
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-72 bg-black text-white p-4 rounded-md shadow-lg" 
        style={{ 
          zIndex: 9999,
          position: 'relative',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        {title && (
          <h3 className="text-lg font-bold mb-1">
            <DecryptedText text={title} />
          </h3>
        )}

        <div className="flex items-center mb-2">
          <StarRating rating={Number(totalScore)} />
        </div>

        {description && (
          <p className="text-sm mb-1">
            <DecryptedText text={description} />
          </p>
        )}

        {address && (
          <p className="text-sm mb-1 flex items-center">
            <MapPin className="mr-2" /> <DecryptedText text={address} />
          </p>
        )}
        {phone && (
          <p className="text-sm mb-1 flex items-center">
            <Phone className="mr-2" /> <DecryptedText text={phone} />
          </p>
        )}
        {website && (
          <p className="text-sm mb-1 flex items-center">
            <Globe className="mr-2" /> <a href={website} target="_blank" rel="noreferrer"><DecryptedText text={website} /></a>
          </p>
        )}

        {openingHours && openingHours.length > 0 && (
          <div className="mt-2">
            <strong>Opening Hours:</strong>
            <ul className="pl-4 mt-1">
              {openingHours.map((oh, idx) => (
                <li key={idx}><DecryptedText text={`${oh.day}: ${oh.hours}`} /></li>
              ))}
            </ul>
          </div>
        )}

        {popularTimesHistogram && popularTimesHistogram.data && (
          <div className="mt-2">
            <strong>Popular Times:</strong>
            <div className="max-w-[250px] mx-auto">
              <Histogram hist={popularTimesHistogram.data} />
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

export async function addPOIMarkers(pois: any[], map: mapboxgl.Map) {
  // Create a container for all markers
  const markersContainer = document.createElement("div");
  markersContainer.style.zIndex = "1";
  document.body.appendChild(markersContainer);

  for (const poi of pois) {
    const { locationLat, locationLng } = poi;
    if (!locationLat || !locationLng) continue;

    const markerEl = document.createElement("div");
    markerEl.className = "poi-marker";
    markerEl.style.zIndex = "1";

    const root = createRoot(markerEl);
    root.render(<HoverCardMarker poi={poi} />);

    new mapboxgl.Marker(markerEl)
      .setLngLat([locationLng, locationLat])
      .addTo(map);
  }
}

export default HoverCardMarker;