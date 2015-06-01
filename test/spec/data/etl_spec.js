define(function() {
  'use strict';
  describeComponent('data/geojson', function() {
    beforeEach(function() {
      setupComponent();
    });

    describe('on config', function() {
      iit('transforms csv row to GeoJSON feature', function() {
        var csvRow = {
          organization_name: 'My org',
          lat: 38,
          lng: -84
        };

        var feature = {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              -84,
              38
            ]
          },
          "properties": {
            "organization_name": "Bluegrass.org Pride Program"
          }
        }

        var processed = this.component.csvRowToFeature(csvRow);
        expect(processed).toEqual(feature);
      });

      iit('transforms csv to GeoJSON', function() {
        var data = [{
          organization_name: 'My org',
          lat: 38,
          lng: -84
        }];

        var geoJson = {
          "type": "FeatureCollection",
          "features": [{
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -84,
                38
              ]
            },
            "properties": {
              "organization_name": "Bluegrass.org Pride Program"
            }
          }]
        };

        var processed = this.component.csvToGeojson(data);
        expect(processed).toEqual(geoJson);
      });
    });
  });
});
