'use strict';
define(
  ['leaflet',
   'jquery',
   'flight'],
  function(L, $, flight) {
    var loader = function() {
      this.after('initialize', function() {
        // load the data
        $.getJSON('config.json', function(config) {
          this.trigger('config', config);

          // load the geojson
          $.getJSON(config.geojson_source, function(data) {
            this.trigger('data', data);
          }.bind(this));
        }.bind(this));
      });
    };

    return flight.component(loader);
  });

