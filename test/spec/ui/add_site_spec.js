define(['test/mock', 'jquery'], function(mock, $) {
  'use strict';
  describeComponent('ui/add_site', function() {
    beforeEach(function() {
      setupComponent('<div id="search"><form><input class=address><button type="submit"/></form></div>',
                     {searchSelector: 'input',
                      mapSelector: 'div'});
      spyOnEvent(document, 'uiSearch');
      spyOn($, 'getJSON');
      this.config = {search: {geosearch: true},
                     map: {maxBounds: 'maxBounds'}};
    });

    describe('config', function() {
      beforeEach(function() {
        spyOn(this.$node, 'hide');
      });
      it('shows the widget in edit mode, with search configured', function() {
        this.config.edit_mode = true;
        $(document).trigger('config', this.config);
        expect(this.$node.hide).not.toHaveBeenCalled();
      });
      it('hides the widget if not in edit mode', function() {
        $(document).trigger('config', this.config);
        expect(this.$node.hide).toHaveBeenCalled();
      });
      it('hides the widget if search disabled', function() {
        this.config.edit_mode = true;
        this.config.search.geosearch = false;
        $(document).trigger('config', this.config);
        expect(this.$node.hide).toHaveBeenCalled();
      });
    });

    describe('form submission', function() {
      beforeEach(function() {
        this.component.maxBounds = [[1, 2], [3, 4]];
        spyOnEvent(this.component.node, 'uiSearch');
      });
      it('does nothing if the input is empty', function() {
        this.$node.find('button').click();
        expect('uiSearch').not.toHaveBeenTriggered();
      });
      it('emits a uiSearch event with the search query', function() {
        this.$node.find('input').val('address');
        this.$node.trigger('click');
        expect('uiSearch').toHaveBeenTriggeredOnAndWith(document,
                                                        {query: 'address',
                                                         responseEvent: 'addSiteAddr'});
      });
    });

    describe("search result handling", function() {
      beforeEach(function() {
        spyOnEvent(document, 'startCreateFeature');
      });
      it("correctly relays create request to the map", function() {
        this.$node.find('input').val('an address');
        this.component.trigger('addSiteAddr', {lat: 90, lng: 0, gubbish: true});
        expect('startCreateFeature').toHaveBeenTriggeredOnAndWith(document, {
          position: {lat: 90, lng: 0},
          address: 'an address'});
      });
    });
  });
});