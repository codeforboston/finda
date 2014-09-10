define(['test/mock', 'jquery'], function(mock, $) {
  'use strict';
  describeComponent('data/search', function() {
    beforeEach(function() {
      setupComponent();
      spyOn($, 'getJSON');
      spyOnEvent(document, 'dataSearchResult');
    });

    describe('on config', function() {
      beforeEach(function() {
        this.component.trigger('config', mock.config);
      });
      it('records the bounds of the search', function() {
        expect(this.component.maxBounds).toEqual(mock.config.map.maxBounds);
      });
    });

    describe('on uiSearch', function() {
      beforeEach(function() {
        this.component.trigger('config', mock.config);
      });
      it('searches for the given query', function() {
        this.component.trigger('uiSearch', {
          query: 'search query'
        });
        expect($.getJSON).toHaveBeenCalledWith(
          this.component.attr.searchUrl,
          {
            format: 'json',
            addressdetails: 1,
            q: 'search query',
            viewbox: '39.2,-78,44.5,-65'
          },
          jasmine.any(Function)
        );
      });
    });

    describe("#onSearchResult", function() {
      it("does nothing if there's no result", function() {
        this.component.searchResults([]);
        expect('dataSearchResult').not.toHaveBeenTriggered();
      });

      it("triggers dataSearchResult if there's a result", function() {
        this.component.searchResults([mock.openSearchResult]);
        expect('dataSearchResult').toHaveBeenTriggeredOnAndWith(
          document,
          mock.parsedSearchResult);
      });
    });
  });
});
