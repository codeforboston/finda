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
  baseUrl: '/base/src/',
  paths: {
    'test': '../test',
    'jquery': '../lib/jquery-1.10.2',
    'leaflet': '../lib/leaflet/leaflet',
    'handlebars': '../lib/handlebars',
    'underscore': '../lib/lodash.underscore.min',
    'flight': '../lib/flight.min'
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
    }
  },

  deps: tests,
  callback: window.__karma__.start
});
