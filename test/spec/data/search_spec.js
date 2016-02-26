define(['test/mock', 'jquery'], function(mock, $) {
  'use strict';
  describeComponent('data/search', function() {
    beforeEach(function() {
      setupComponent();
      spyOn($, 'getJSON');
      spyOnEvent(document, 'dataSearchResult');
      spyOnEvent(document, 'searchFoo'); // alternate responseEvent below
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

      beforeEach(function() {
        // Deal with the currying in search-results-handler:
        // it's a function that takes a set of options, and returns
        // the function which handles the actual search-result
        // according to those options.
        this.searchHandler = this.component.searchResultsHandler({});
      });

      it("does nothing if there's no result", function() {
        this.searchHandler([]);
        expect('dataSearchResult').not.toHaveBeenTriggered();
      });

      it("triggers dataSearchResult if there's a result", function() {
        this.searchHandler([mock.openSearchResult]);
        expect('dataSearchResult').toHaveBeenTriggeredOnAndWith(
          document,
          mock.parsedSearchResult);
      });

      it("triggers alternate event if required", function() {
        var searchHandler = 
          this.component.searchResultsHandler({responseEvent: 'searchFoo'});
        searchHandler([mock.openSearchResult]);
        expect('searchFoo').toHaveBeenTriggeredOnAndWith(
          document,
          mock.parsedSearchResult);
      });
    });
  });
});
