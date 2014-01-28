'use strict';
require.config({
  baseUrl: "src/",
  paths: {
    "jquery": "../lib/jquery-1.10.2",
    "leaflet": "../lib/leaflet/leaflet",
    "handlebars": "../lib/handlebars",
    "leaflet-search": "../lib/leaflet/leaflet-search",
    "leaflet.control.geosearch": "../lib/leaflet/l.control.geosearch",
    "leaflet.geosearch.provider.google": "../lib/leaflet/l.geosearch.provider.google"
  },
  shim: {
    'handlebars': {
      exports: 'Handlebars'
    },
    'leaflet-search': {
      deps: ['leaflet'],
      exports: 'L'
    },
    'leaflet.control.geosearch': {
      deps: ['leaflet'],
      exports: 'L'
    },
    'leaflet.geosearch.provider.google': {
      deps: ['leaflet.control.geosearch'],
      exports: 'L'
    }
  }
});

define(['jquery', 'main'], function($, main) {
  $.getJSON("config.json", function(config) {
    $.getJSON("data.geojson", function(data) {
      main(config, data);
    });
  });
});
