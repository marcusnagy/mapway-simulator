import { createRoot } from "react-dom/client";
import { HoverCard, HoverCardTrigger, HoverCardContent} from "@/components/ui/hover-card";
import DecryptedText from "@/components/mapui/DecryptedText";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import {Histogram, StarRating} from "@/components/mapui/Poi";
import { Button } from "@/components/ui/button";
import { HexagonPOISet, POI } from "@/types/map";
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
            width: "40px", // Ensures the button is a square
            height: "40px", // Same as width
            padding: 0, // Ensures no extra spacing inside the button
            borderRadius: "50%", // Makes the button circular
            backgroundSize: "cover", // Ensures the image covers the entire button
            backgroundPosition: "center", // Centers the image within the button
            cursor: "pointer", // Sets the pointer cursor
            overflow: "hidden", // Ensures the image does not spill out of the circular boundary
            backgroundColor: "transparent", // Sets the background to transparent
            backgroundImage: poi.imageUrl
              ? `url(${poi.imageUrl})`
              : "url('https://img.icons8.com/?size=512&id=JnKur3Cocs7X&format=png&color=FD7E14')", // Sets the background image
          }}
        />
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 bg-black text-white p-4 rounded-md shadow-lg" 
        style={{ 
          zIndex: 99999,
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
           <Globe className="mr-2" />
           <a href={website} target="_blank" rel="noreferrer">
             <DecryptedText
               text={
                 website.length > 30
                   ? `${website.substring(0, 27)}...`
                   : website
               }
             />
           </a>
         </p>
        )}

        {openingHours && (
          <div className="mt-2">
            <strong>Opening Hours:</strong>
            <ul className="pl-4 mt-1">
              {(() => {
                try {
                  const hours = typeof openingHours === 'string' ? JSON.parse(openingHours) : openingHours;
                  return Array.isArray(hours) 
                    ? hours.map((oh, idx) => (
                        <li key={idx}><DecryptedText text={`${oh.day}: ${oh.hours}`} /></li>
                      ))
                    : null;
                } catch (error) {
                  console.warn('Error parsing openingHours:', error);
                  return null;
                }
              })()}
            </ul>
          </div>
        )}

        {popularTimesHistogram && popularTimesHistogram.data && Object.keys(popularTimesHistogram.data).some(day => 
          popularTimesHistogram.data[day].some(d => d.occupancyPercent > 0)
        ) && (
          <div className="mt-2 relative">
            <strong>Popular Times:</strong>
            <div className="w-full relative px-4">
              <Histogram hist={popularTimesHistogram.data} />
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

export async function createPOIMarker(poi: POI, map: mapboxgl.Map): Promise<mapboxgl.Marker> {
    // Create a container for all markers
    const markersContainer = document.createElement("div");
    markersContainer.style.zIndex = "1";
    document.body.appendChild(markersContainer);
  
      const markerEl = document.createElement("div");
      markerEl.className = "poi-marker";
      markerEl.style.zIndex = "1";
  
      const root = createRoot(markerEl);
      root.render(<HoverCardMarker poi={poi} />);
  
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([poi.locationLng, poi.locationLat])
        .addTo(map);
  
      
      return marker
}

export async function addPOIMarkers(
  pois: POI[], 
  map: mapboxgl.Map, 
  selectedCategories: string[] = []
): Promise<HexagonPOISet> {
  const markers: HexagonPOISet = new HexagonPOISet();
  
  // Remove existing event listeners if they exist
  map.off('sourcedata', updateMarkers);
  map.off('zoom', updateMarkers);
  map.off('moveend', updateMarkers);
  map.off('click', 'clusters', handleClusterClick);
  map.off('mouseenter', 'clusters', handleClusterMouseEnter);
  map.off('mouseleave', 'clusters', handleClusterMouseLeave);

  // Clean up existing layers
  if (map.getLayer('clusters')) {
    map.removeLayer('clusters');
  }
  if (map.getLayer('cluster-count')) {
    map.removeLayer('cluster-count');
  }
  if (map.getLayer('clusters-glow')) {
    map.removeLayer('clusters-glow');
  }
  if (map.getSource('pois')) {
    map.removeSource('pois');
  }

  // If no categories are selected or no POIs, just return empty set
  if (selectedCategories.length === 0 || pois.length === 0) {
    // Clean up existing markers but keep the clusters
    markers.getAll().forEach(hexPoi => {
      if (hexPoi.marker) {
        hexPoi.marker.remove();
        const el = hexPoi.marker.getElement();
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }
    });
    markers.clear();
    return markers;
  }

  // Filter POIs based on selected categories
  const filteredPois = pois.filter(poi => 
    poi.categories?.some(category => 
      selectedCategories.includes(category)
    )
  );

  if (filteredPois.length === 0) {
    return markers;
  }

  // Convert POIs to GeoJSON
  const geojsonData: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: filteredPois.map(poi => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [poi.locationLng, poi.locationLat]
      },
      properties: {
        ...poi,
        popularTimesHistogram: poi.popularTimesHistogram ? JSON.stringify(poi.popularTimesHistogram) : null,
        openingHours: poi.openingHours ? JSON.stringify(poi.openingHours) : null
      }
    }))
  };

  // Add the GeoJSON source with clustering enabled
  map.addSource('pois', {
    type: 'geojson',
    data: geojsonData,
    cluster: true,
    clusterMaxZoom: 15,
    clusterRadius: 100,
    maxzoom: 18
  });

  // Add cluster layers
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'pois',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#4F46E5', // Indigo base color
        5, '#818CF8', // Lighter indigo
        15, '#6366F1' // Medium indigo
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        25, // Base size
        5, 35, // Medium size
        15, 45 // Large size
      ],
      'circle-stroke-width': 3,
      'circle-stroke-color': 'rgba(255, 255, 255, 0.5)',
      'circle-blur': 0.15,
      'circle-opacity': 0.9,
      'circle-pitch-alignment': 'map'
    }
  });

  // Add a glow effect layer
  map.addLayer({
    id: 'clusters-glow',
    type: 'circle',
    source: 'pois',
    filter: ['has', 'point_count'],
    paint: {
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        30, // Slightly larger than main circle
        5, 40,
        15, 50
      ],
      'circle-color': '#4338CA', // Dark indigo
      'circle-opacity': 0.2,
      'circle-blur': 1
    }
  });

  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'pois',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': [
        'step',
        ['get', 'point_count'],
        14, // Base size
        5, 16, // Medium size
        15, 18 // Large size
      ],
      'text-allow-overlap': true
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': 'rgba(0, 0, 0, 0.2)',
      'text-halo-width': 2
    }
  });

  let isUpdating = false;
  const markerCache = new Map<string, mapboxgl.Marker>();

  // Function to update markers based on current view
  function updateMarkers() {
    if (isUpdating || !map.getSource('pois') || !map.isSourceLoaded('pois')) return;
    isUpdating = true;

    try {
      const zoom = map.getZoom();
      const bounds = map.getBounds();

      // Get all clusters at current zoom level
      const clusters = map.queryRenderedFeatures({ layers: ['clusters'] });
      const clusterPoints = new Set<string>();
      
      // Collect all points that are part of clusters
      clusters.forEach(cluster => {
        const source = map.getSource('pois') as mapboxgl.GeoJSONSource;
        if (cluster.properties?.cluster_id) {
          const leaves = source.getClusterLeaves(
            cluster.properties.cluster_id,
            Infinity,
            0,
            (err, features) => {
              if (!err && features) {
                features.forEach(feature => {
                  if (feature.properties?.placeId) {
                    clusterPoints.add(feature.properties.placeId);
                  }
                });
              }
            }
          );
        }
      });

      // Clear markers that are:
      // 1. No longer in view
      // 2. Below zoom threshold
      // 3. Part of a cluster
      markers.getAll().forEach(hexPoi => {
        const marker = hexPoi.marker;
        if (!marker) return;

        const pos = marker.getLngLat();
        const isInBounds = bounds.contains(pos);
        const shouldBeVisible = zoom >= 14 && isInBounds;  // Increased from 11 to 14
        const isInCluster = clusterPoints.has(hexPoi.placeId);

        if (!shouldBeVisible || isInCluster) {
          marker.remove();
          const el = marker.getElement();
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
          markers.delete(hexPoi.placeId);
          markerCache.delete(hexPoi.placeId);
        }
      });

      // Don't create new markers if zoomed out
      if (zoom < 14) {  // Increased from 11 to 14
        isUpdating = false;
        return;
      }

      // Get visible features that are not part of clusters
      const features = map.querySourceFeatures('pois', {
        filter: ['!', ['has', 'point_count']]
      });

      const visibleFeatures = features.filter(feature => {
        const [lng, lat] = (feature.geometry as any).coordinates;
        return bounds.contains([lng, lat]) && !clusterPoints.has(feature.properties?.placeId);
      });

      // Create or update markers
      const markersToAdd: Array<{el: HTMLElement, coordinates: [number, number], props: any}> = [];

      visibleFeatures.forEach(feature => {
        const props = feature.properties;
        if (!props || !feature.geometry || feature.geometry.type !== 'Point') return;

        // Skip if marker already exists
        if (markerCache.has(props.placeId)) return;

        const parsedProps = {
          ...props,
          popularTimesHistogram: props.popularTimesHistogram ? JSON.parse(props.popularTimesHistogram) : null,
          openingHours: props.openingHours ? JSON.parse(props.openingHours) : null
        };

        const coordinates = (feature.geometry as any).coordinates;
        const markerEl = document.createElement("div");
        markerEl.className = "poi-marker";
        markerEl.style.zIndex = "1";

        markersToAdd.push({
          el: markerEl,
          coordinates,
          props: parsedProps
        });
      });

      // Batch create markers
      if (markersToAdd.length > 0) {
        requestAnimationFrame(() => {
          markersToAdd.forEach(({ el, coordinates, props }) => {
            if (markerCache.has(props.placeId)) return;

            const root = createRoot(el);
            root.render(<HoverCardMarker poi={props} />);

            const marker = new mapboxgl.Marker(el)
              .setLngLat(coordinates)
              .addTo(map);

            markerCache.set(props.placeId, marker);
            markers.add({
              placeId: props.placeId,
              h3Index: props.h3Index,
              marker,
              poi: props,
            });
          });
        });
      }
    } finally {
      isUpdating = false;
    }
  }

  // Handle cluster click
  function handleClusterClick(e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) {
    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
    if (!features.length) return;

    const clusterId = features[0].properties?.cluster_id;
    (map.getSource('pois') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
      clusterId,
      (err, zoom) => {
        if (err) return;

        map.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: zoom
        });
      }
    );
  }

  function handleClusterMouseEnter() {
    map.getCanvas().style.cursor = 'pointer';
  }

  function handleClusterMouseLeave() {
    map.getCanvas().style.cursor = '';
  }

  // Add event listeners
  map.on('sourcedata', updateMarkers);
  map.on('zoom', updateMarkers);
  map.on('moveend', updateMarkers);
  map.on('click', 'clusters', handleClusterClick);
  map.on('mouseenter', 'clusters', handleClusterMouseEnter);
  map.on('mouseleave', 'clusters', handleClusterMouseLeave);

  // Initial update
  updateMarkers();

  return markers;
}

export default HoverCardMarker;