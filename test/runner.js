'use strict';
var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/_spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

require.config({
  baseUrl: "/base/scripts/",
  paths: {
    "test": "../test",
    "jquery": "dependencies/jquery-1.10.2",
    "leaflet": "../leaflet/leaflet",
    "handlebars": "dependencies/handlebars",
    "leaflet-search": "../leaflet/leaflet-search",
    "leaflet.control.geosearch": "../leaflet/l.control.geosearch",
    "leaflet.geosearch.provider.google": "../leaflet/l.geosearch.provider.google"
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
  },

  deps: tests,
  callback: window.__karma__.start
});
