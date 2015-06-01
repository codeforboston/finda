// define(['test/mock', 'lodash', 'd3'], function(mock, _, d3) {
define(function() {
  'use strict';
  describeComponent('data/geojson', function() {
    beforeEach(function() {
      setupComponent();
    });

    describe('on config', function() {
      iit('transforms csv to GeoJSON', function() {
        var data = {
          features: [{}]
        };
        var processed = this.component.processData(data);
        expect(processed.features[0].id).not.toBeUndefined();
      });
    });
  });
});
