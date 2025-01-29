<div align="center">
  <img src="public/android-chrome-512x512.png" alt="Logo" width="200"/>
</div>

---

# Route Simulation with POI Visualization

This project simulates a car driving along a route from source to destination, using Uber H3 Hexcells to query and visualize Points of Interest (POIs) along the way. The system integrates with a backend service that handles POI data retrieval and processing.

## Project Setup

### Prerequisites

Before starting, ensure you have:
1. Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
2. An APIFY API key for backend service crawling
3. A Mapbox API key for map rendering

### Backend Integration

This project works in conjunction with the POI backend service available at:
[https://github.com/marcusnagy/apify-poi-data](https://github.com/marcusnagy/apify-poi-data)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create an API key in mapbox and use it as input in the mapbox api key field

### Running the Project

1. Start the backend service
2. Start the frontend project

## Project Structure

### Frontend

The frontend project is built using React and Vite. It includes:

- `src/components/mapui/HoverCardMarker.tsx`: Renders a hover card for POI markers
- `src/components/mapui/Map.tsx`: Main map component that integrates with Mapbox
- `src/components/mapui/POIMarker.tsx`: Renders POI markers on the map
- `src/components/mapui/RouteSimulation.tsx`: Main component for route simulation
- `src/components/mapui/Sidebar.tsx`: Sidebar component for POI filtering
