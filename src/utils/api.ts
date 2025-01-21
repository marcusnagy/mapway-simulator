export async function fetchPOIData(visitedCells: string[]) {
  const cells = [...visitedCells];
  const queryString = cells.map((cell) => `parentCells=${encodeURIComponent(cell)}`).join('&');
  const res = await fetch(`/v1/poi/h3?${queryString}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch POI data. Status: ${res.status}`);
  }
  const data = await res.json();
  console.log('POI data:', data);
  return data;
}

export async function sendHexRequest(hexCollection: GeoJSON.FeatureCollection<GeoJSON.Polygon>) {
  const polygons = hexCollection.features.map((feature) => {
    const coordsArray = feature.geometry.coordinates[0].map(([lng, lat]) => ({
      longitude: lng,
      latitude: lat,
    }));
    return { coordinates: coordsArray };
  });

  const body = {
    maxCrawledPlacesPerSearch: 3,
    customGeolocation: {
      type: "MULTIPOLYGON",
      polygons: polygons,
    },
    allPlacesNoSearchAction: "ALL_PLACES_NO_SEARCH_OCR"
  };

  const res = await fetch("/v1/maps/search/scraper", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Failed to send hex request. Status: ${res.status}`);
  }

  return res;
}