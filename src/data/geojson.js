define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var Tabletop = require('Tabletop');
  var _ = require('lodash');

  module.exports = flight.component(function loader() {
    this.onConfig = function onConfig() {
      // load the geojson
      Tabletop.init( {
        key: '1oWIrEg77ZSOiYGUA6H4b1wlvtC8pIrvdznQDcbLEUPg',
        callback: function(data) {
          data.splice(0, 2);
          this.trigger('data', this.processData(this.csvToGeojson(data)));
        }.bind(this),
        simpleSheet: true
      });
    };

    this.csvRowToProperties = function csvRowToProperties(csvRow, facetValues) {
      var properties = {
        "organization_name": csvRow.organization_name,
        "phone_numbers": csvRow["Phone Number"],
        "address": csvRow.address + " " + csvRow.physicalcity + ", Kentucky",
        "city": csvRow.physicalcity
      };

      _.each(facetValues, function(facet, facetValue) {
        if (! properties[facet])  { properties[facet] = []; }
        if (csvRow[facetValue] === "1") {
          properties[facet].push(facetValue);
        }
      });
      return properties;
    };

    this.csvRowToFeature = function csvRowToFeature(csvRow, facetValues) {
      return {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            csvRow.lng,
            csvRow.lat
          ]
        },
        "properties": this.csvRowToProperties(csvRow, facetValues)
      };
    };

    this.csvToGeojson = function csvToGeojson(csv) {
      var facetValues = {
        oupatient_offered: "facility_type",
        residential_offered: "facility_type",
        outpatient_intensive: "out_patient",
        outpatient_services: "out_patient",
        detox_offered: "residential",
        gender_male: "gender",
        gender_female: "gender",
        pregnancy_services: "pregnancy",
        age_child: "age",
        age_adult: "age",
        insurance_medicare: "insurance",
        insurance_medicaid: "insurance",
        insurance_gov_funded: "insurance",
        insurance_private: "insurance",
        insurance_payment_assistance: "insurance",
        insurance_no_fee: "insurance",
        insurance_self_pay: "insurance"
      };
      csv = _.filter(csv, function(row) {
        return row.organization_name !== "";
      });
      var features = _.map(csv, function(row) {
        return this.csvRowToFeature(row, facetValues);
      }.bind(this));

      return {
        "type": "FeatureCollection",
        "features": features
      };
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
