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

    this.csvRowToProperties = function csvRowToProperties(csvRow, searchValues) {
      var properties = {"organization_name": csvRow.organization_name};
      _.each(searchValues, function(facet, searchValue) {
        if (! properties[facet])  { properties[facet] = []; }
        properties[facet].push(searchValue);
      });
      return properties;
    };

    this.csvRowToFeature = function csvRowToFeature(csvRow, searchValues) {
      return {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            csvRow.lng,
            csvRow.lat
          ]
        },
        "properties": this.csvRowToProperties(csvRow, searchValues)
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
