require.config({
  baseUrl: 'src/',
  paths: {
    'jquery': '../lib/jquery-1.10.2',
    'bootstrap': '../lib/bootstrap.min',
    'leaflet': '../lib/leaflet/leaflet',
    'handlebars': '../lib/handlebars',
    'lodash': '../lib/lodash.min',
    'flight': '../lib/flight.min',
  },
  shim: {
    'handlebars': {
      exports: 'Handlebars'
    },
    'underscore': {
      exports: '_'
    },
    'flight': {
      deps: ['../lib/es5-shim.min', '../lib/es5-sham.min'],
      exports: 'flight'
    },
    'bootstrap': {
      deps: ['jquery'],
      exports: '$'
    }
  }
});

define(
  ['data/loader', 'data/facet', 'ui/map', 'ui/search', 'ui/info',
   'ui/facet', 'ui/project', 'bootstrap'],
  function(Loader, DataFacet, Map, Search, Info, Facet, Project) {
    'use strict';
    // attach components to the DOM
    Map.attachTo('#map');
    Search.attachTo('#search', {mapSelector: '#map'});
    Info.attachTo('#info');
    Facet.attachTo('#facets');
    DataFacet.attachTo(document);
    Project.attachTo(document);
    Loader.attachTo(document);
  });
