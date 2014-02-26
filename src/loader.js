define(
  ['leaflet',
   'jquery',
   'flight'],
  function(L, $, flight) {
    'use strict';
    var loader = function() {
      this.after('initialize', function() {
        // load the data
        $.getJSON('config.json', function(config) {
          this.trigger('config', config);
        }.bind(this));
        $.getJSON('data.geojson', function(data) {
          this.trigger('data', data);
        }.bind(this));
      });
    };

    return flight.component(loader);
  });
         
