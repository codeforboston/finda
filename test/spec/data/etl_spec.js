define(function() {
  'use strict';
  describeComponent('data/geojson', function() {
    beforeEach(function() {
      setupComponent();
    });

    describe('on config', function() {
      it('transforms csv row to GeoJSON feature', function() {
        var csvRow = {
          organization_name: 'My org',
          lat: 38,
          lng: -84,
          oupatient_offered: "1"
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
            "organization_name": "My org",
            "facility_type": [
              "oupatient_offered"
            ]
          }
        }

        var processed = this.component.csvRowToFeature(csvRow, {oupatient_offered: "facility_type"});
        expect(processed).toEqual(feature);
      });

      // todo: find correct language for "search value"
      iit('groups two serach values into facets', function() {

        var csvRow = {
          organization_name: 'My org',
          oupatient_offered: "1",
          residential_offered: "1"
        };

        var searchValues = {
          oupatient_offered: "facility_type",
          residential_offered: "facility_type",
        }

        var properties = {
          "organization_name": "My org",
          "facility_type": [
            "oupatient_offered",
            "residential_offered"
          ]
        };

        var processed = this.component.csvRowToProperties(csvRow, searchValues);
        expect(processed.organization_name).toEqual(properties.organization_name);
        expect(processed.facility_type).toEqual(properties.facility_type);
      });

      it('it only includes the search values an org offers', function() {

        var csvRow = {
          organization_name: 'My org',
          oupatient_offered: "1",
          residential_offered: "0"
        };

        var searchValues = {
          oupatient_offered: "facility_type",
          residential_offered: "facility_type",
        }

        var properties = {
          "organization_name": "My org",
          "facility_type": [
            "oupatient_offered"
          ]
        };

        var processed = this.component.csvRowToProperties(csvRow, searchValues);
        expect(processed).toEqual(properties);
      });
    });
  });
});
