require.config({
  baseUrl: 'src/',
  paths: {
    'jquery': '../lib/jquery-1.11.1.min',
    'bootstrap': '../lib/bootstrap.min',
    'leaflet': '../lib/leaflet/leaflet',
    'L.Control.Locate': '../lib/leaflet/L.Control.Locate',
    'leaflet.markercluster': '../lib/leaflet.markercluster/leaflet.markercluster',
    'handlebars': '../lib/handlebars',
    'lodash': '../lib/lodash.min',
    'flight': '../lib/flight.min',
    'fuse': '../lib/fuse.min'
  },
  shim: {
    'handlebars': {
      exports: 'Handlebars'
    },
    'underscore': {
      exports: '_'
    },
    'flight': {
      exports: 'flight'
    },
    'bootstrap': ['jquery'],
    leaflet: {
      exports: 'L'
    },
    'L.Control.Locate': ['leaflet'],
    'leaflet.markercluster': ['leaflet']
  }
});

define(function(require) {
  'use strict';
  require('bootstrap');
  // attach components to the DOM
  require('ui/map').attachTo('#map');
  require('ui/search').attachTo('#search');
  require('ui/search_results').attachTo('#search-results');
  require('ui/info').attachTo('#info');
  require('ui/list').attachTo('#list');
  require('ui/facet').attachTo('#facets');
  require('ui/loading').attachTo('#loading');
  require('ui/project').attachTo(document);
  require('data/facet').attachTo(document);
  require('data/analytics').attachTo(document);
  require('data/search').attachTo(document);
  require('data/typeahead').attachTo(document);
  require('data/geojson').attachTo(document);
  require('data/config').attachTo(document);
});
