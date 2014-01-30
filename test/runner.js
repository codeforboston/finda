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
  baseUrl: "/base/src/",
  paths: {
    "test": "../test",
    "jquery": "../lib/jquery-1.10.2",
    "leaflet": "../lib/leaflet/leaflet",
    "handlebars": "../lib/handlebars",
    "leaflet-search": "../lib/leaflet/leaflet-search",
    "leaflet.control.geosearch": "../lib/leaflet/l.control.geosearch",
    "leaflet.geosearch.provider.google": "../lib/leaflet/l.geosearch.provider.google",
    "underscore": "../lib/lodash.underscore.min"
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
    },
    'underscore': {
      exports: '_'
    }
  },

  deps: tests,
  callback: window.__karma__.start
});
