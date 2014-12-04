define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var _ = require('lodash');

  module.exports = flight.component(function search() {
    this.defaultAttrs({
      searchSelector: 'input',
      searchResultsSelector: '#search-results',
      resultTemplate: '<strong>{{ organization_name }}</strong> ({{ address }})'
    });

    this.configureSearch = function(ev, config) {
      if (config.search && config.search.geosearch) {
        this.$node.show();
      } else {
        this.$node.hide();
      }
    };

    this.inProgressSearch = _.debounce(function(ev) {
      ev.preventDefault();
      if (ev.keyCode === 13) { // Enter
        return;
      }
      var query = this.select('searchSelector').val();
      this.trigger(document, 'uiInProgressSearch', {
        query: query
      });
    }, 100);

    this.search = function(ev) {
      ev.preventDefault();
      var address = this.select('searchSelector').val();
      if (address) {
        this.trigger(document, 'uiSearch', {query: address});
      }
      this.select('searchResultsSelector').trigger('uiHideSearchResults');
    };

    this.onSearchResult = function(ev, result) {
      this.select('searchSelector').attr('placeholder',
                                         result.name).val('');
    };

    this.after('initialize', function() {
      this.on(this.attr.searchSelector, 'keydown', this.inProgressSearch);
      this.on('submit', this.search);
      this.on(document, 'config', this.configureSearch);
      this.on(document, 'dataSearchResult', this.onSearchResult);
    });
  });
});
