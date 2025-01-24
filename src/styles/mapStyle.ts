export const darkMapStyle = {
  version: 8 as const,
  name: 'Dark GTA Style',
  sources: {
    'maplibre-streets': {
      type: 'vector',
      url: 'https://demotiles.maplibre.org/tiles/tiles.json'
    }
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#1a1a1a'
      }
    },
    {
      id: 'water',
      type: 'fill',
      source: 'maplibre-streets',
      'source-layer': 'water',
      paint: {
        'fill-color': '#141b2b',
        'fill-opacity': 0.8
      }
    },
    {
      id: 'roads',
      type: 'line',
      source: 'maplibre-streets',
      'source-layer': 'roads',
      paint: {
        'line-color': '#3b3b3b',
        'line-width': 1,
        'line-opacity': 0.8
      }
    },
    {
      id: 'buildings',
      type: 'fill',
      source: 'maplibre-streets',
      'source-layer': 'buildings',
      paint: {
        'fill-color': '#242424',
        'fill-opacity': 0.8
      }
    }
  ]
};

export const poiLayerStyle = {
  id: 'poi-clusters',
  type: 'circle' as const,
  source: 'pois',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#51bbd6',
      100,
      '#f1f075',
      750,
      '#f28cb1'
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      20,
      100,
      30,
      750,
      40
    ]
  }
};

export const poiLabelsStyle = {
  id: 'poi-labels',
  type: 'symbol' as const,
  source: 'pois',
  filter: ['!', ['has', 'point_count']],
  layout: {
    'text-field': ['get', 'title'],
    'text-font': ['Open Sans Regular'],
    'text-size': 12,
    'text-offset': [0, 0.6],
    'text-anchor': 'top'
  },
  paint: {
    'text-color': '#ffffff',
    'text-halo-color': '#000000',
    'text-halo-width': 1
  }
};