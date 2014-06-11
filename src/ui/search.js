define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  var _ = require('lodash');
  var Handlebars = require('handlebars');

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

    this.search = function(ev) {
      ev.preventDefault();
      var address = this.select('searchSelector').val();
      if (address) {
        this.trigger(document, 'uiSearch', {query: address});
      }
    };

    this.onSearchResult = function(ev, result) {
      this.select('searchSelector').attr('placeholder',
                                         result.name).val('');
      this.trigger(this.attr.mapSelector,
                   'panTo',
                   {lat: result.lat,
                    lng: result.lng});
    };

    this.inProgressSearch = _.debounce(function() {
      var query = this.select('searchSelector').val();
      this.trigger(document, 'uiInProgressSearch', {query: query});
    }, 100);

    this.displaySearchResults = function(ev, options) {
      var results = options.results,
          resultTemplate = Handlebars.compile(this.attr.resultTemplate),
          that = this;
      this.select('searchResultsSelector').empty();
      if (this.select('searchSelector').val() && results.length) {
        _.each(results.slice(0, 5), function(result) {
          var html = resultTemplate(result.properties);
          this.select('searchResultsSelector').append(
            $("<li/>").html(html).click(function(ev) {
              that.select('searchSelector').val(ev.target.innerText);
              that.trigger('hideSearchResults');
              that.trigger(document, 'selectFeature', result);
            }));
        }, this);
        this.select('searchResultsSelector').show();
      } else {
        this.select('searchResultsSelector').hide();
      }
    };

    this.hideSearchResults = function(ev) {
      ev.preventDefault();
      this.select('searchResultsSelector').hide();
    };

    this.after('initialize', function() {
      this.on(this.attr.searchSelector, 'keydown', this.inProgressSearch);
      this.on('submit', this.search);
      this.on(document, 'config', this.configureSearch);
      this.on(document, 'dataSearchResult', this.onSearchResult);
      this.on(document, 'dataTypeaheadResults', this.displaySearchResults);
    });
  });
});
