define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  module.exports = flight.component(function loader() {
    this.onConfig = function onConfig(ev, config) {
      // load the geojson
      $.getJSON(config.geojson_source, function(data) {
        this.trigger('data', this.processData(data));
      }.bind(this));
    };

    this.processData = function processData(data) {
      // give each feature an string ID if it doesn't have one already
      data.features.forEach(function(feature, index) {
        if (!feature.id) {
          feature.id = 'finda-' + index;
        } else {
          feature.id = feature.id.toString();
        }
      });
      return data;
    };

    this.after('initialize', function() {
      // load the data
      this.on(document, 'config', this.onConfig);
    });
  });
});
