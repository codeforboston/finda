define(['test/mock', 'jquery'], function(mock, $) {
  'use strict';
  describeComponent('ui/search', function() {
    beforeEach(function() {
      setupComponent('<div><form><input class=address></form></div>',
                     {searchSelector: 'input',
                      mapSelector: 'div'});
      spyOnEvent('div', 'panTo');
      spyOnEvent(document, 'uiSearch');
      spyOn($, 'getJSON');
      this.config = {search: {geosearch: true},
                     map: {maxBounds: 'maxBounds'}};
    });

    describe('configuration sets up local values', function() {
      beforeEach(function() {
        $(document).trigger('config', this.config);
      });
      it('hides the widget if it is not requested', function() {
        this.config.search.geosearch = false;
        $(document).trigger('config', this.config);
        expect(this.$node).not.toBeVisible();
      });
    });

    describe('form submission', function() {
      beforeEach(function() {
        this.component.maxBounds = [[1, 2], [3, 4]];
        spyOnEvent(this.component.node, 'uiSearch');
      });
      it('does nothing if the input is empty', function() {
        this.$node.find('input').submit();
        expect('uiSearch').not.toHaveBeenTriggered();
      });
      it('emits a uiSearch event with the search query', function() {
        this.$node.find('input').val('address').submit();
        expect('uiSearch').toHaveBeenTriggeredOnAndWith(document,
                                                        {query: 'address'});
      });
    });

    describe('dataSearchResult', function() {
      beforeEach(function() {
        $(document).trigger('dataSearchResult', mock.parsedSearchResult);
      });
      it('sets the placeholder display to the city', function() {
        var input = this.component.select('searchSelector');
        expect(input.attr('placeholder')).toEqual(
          mock.parsedSearchResult.name);
        expect(input.val()).toEqual('');
      });
    });
  });
});
