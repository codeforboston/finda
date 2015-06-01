define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  // var d3 = require('d3');
  var _ = require('lodash');

  module.exports = flight.component(function loader() {
    this.onConfig = function onConfig(ev, config) {
      // load the geojson
      $.getJSON(config.geojson_source, function(data) {
        this.trigger('data', this.processData(data));
      }.bind(this));
    };

    this.csvRowToFeature = function csvRowToFeature(csvRow) {
      return {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              csvRow.lng,
              csvRow.lat
            ]
          },
          "properties": {
            "organization_name": "Bluegrass.org Pride Program"
          }
        };
    };

    this.csvToGeojson = function csvToGeojson(csv) {
      var _this = this;
      var features = _.map(csv, function(row) {
        return _this.csvRowToFeature(row);
      });

      return {
        "type": "FeatureCollection",
        "features": features
      };
    };

    this.processData = function processData(data) {
      // give each feature an ID if it doesn't have one already
      // d3.csv("/treatment-centers.csv", function(data) {
      //   console.log(data[0]);
      // });

      data.features.forEach(function(feature, index) {
        if (!feature.id) {
          feature.id = 'finda-' + index;
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
