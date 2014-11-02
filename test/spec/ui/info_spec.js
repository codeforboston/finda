define(['infotemplates', 'jquery', 'test/mock'], 
       function(templates, $, mock) {

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

    describe('in edit mode', function() {
      beforeEach(function() {

        var editConfig = _.cloneDeep(mock.config);
        editConfig.edit_mode = true;
        $(document).trigger('config', editConfig);

        this.feature = mock.data.features[0];
      });

      it("doesn't do anything", function() {
        spyOn(templates, 'popup');
        $(document).trigger('selectFeature', this.feature);
        expect(templates.popup).not.toHaveBeenCalled();
      });
    });

  });
});
