'use strict';
define(['infotemplates'], function(templates) {
  describeComponent('ui/info', function() {
    beforeEach(function() {
      setupComponent();
    });

    describe('on selectFeature', function() {
      it('creates a popup with the properties of the feature and config', function() {
        var config = {properties: 'config properties'},
            feature = {properties: 'feature properties'};
        spyOn(templates, 'popup');
        $(document).trigger('config', config);
        $(document).trigger('selectFeature', feature);
        expect(templates.popup).toHaveBeenCalledWith(
          config.properties, feature.properties);
      });
    });
  });
});
