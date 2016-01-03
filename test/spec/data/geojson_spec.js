define(function() {
  'use strict';
  describeComponent('data/geojson', function() {
    beforeEach(function() {
      setupComponent();
    });

    describe("#processData", function() {
      it("gives an ID to features", function() {
        var data = {
          features: [{}]
        };
        var processed = this.component.processData(data);
        expect(processed.features[0].id).not.toBeUndefined();
      });

      it("keeps an existing ID if present", function() {
        var data = {
          features: [{
            id: 1
          }]
        };
        var processed = this.component.processData(data);
        expect(processed.features[0].id).toEqual('1');
      });
    });

    describe('ETL CSV to GeoJSON', function() {
      it('groups facet values into facets', function() {

        var csvRow = {
          organization_name: 'My org',
          outpatient_offered: "1",
          residential_offered: "1"
        };

        var facetValues = {
          outpatient_offered: "facility_type",
          residential_offered: "facility_type",
        }

        var properties = {
          "organization_name": "My org",
          "facility_type": [
            "outpatient_offered",
            "residential_offered"
          ]
        };

        var processed = this.component.csvRowToProperties(csvRow, facetValues);
        expect(processed.organization_name).toEqual(properties.organization_name);
        expect(processed.facility_type).toEqual(properties.facility_type);
      });

      it('it only includes the search values an org offers', function() {

        var csvRow = {
          organization_name: 'My org',
          outpatient_offered: "1",
          residential_offered: "0"
        };

        var facetValues = {
          outpatient_offered: "facility_type",
          residential_offered: "facility_type",
        }

        var properties = {
          "organization_name": "My org",
          "facility_type": [
            "outpatient_offered"
          ]
        };

        var processed = this.component.csvRowToProperties(csvRow, facetValues);
        expect(processed.facility_type).toEqual(properties.facility_type);
      });
    });
  });
});
