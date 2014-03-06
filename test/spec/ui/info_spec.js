define(['infotemplates', 'jquery'], function(templates, $) {
  'use strict';
  describeComponent('ui/info', function() {
    beforeEach(function() {
      setupComponent('<div><button class="close"/></div>');
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

    describe('on close click', function() {
      it('hides the popup', function() {
        spyOn(this.$node, 'hide');
        this.$node.find('.close').click();
        expect(this.$node.hide).toHaveBeenCalledWith();
      });
    });
  });
});
