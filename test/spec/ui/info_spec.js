define(['infotemplates', 'jquery', 'test/mock', 'lodash'], 
       function(templates, $, mock, _) {

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

      // Ideally, would also be testing the behavior of the JSONEditor
      // object itself, but hard to do that without tickling its innards...

      it('creates an editor on select feature', function() {
        $(document).trigger('selectFeature', this.feature);
        expect(this.component.currentEditor).not.toBe(undefined);
      });

      it('destroys the editor on close click', function() {
        $(document).trigger('selectFeature', this.feature);
        this.$node.find('.close').click();
        expect(this.component.currentEditor).toBe(undefined);
      });
    });

  });
});
