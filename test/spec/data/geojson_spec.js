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
  });
});
