define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  var _ = require('lodash');
  var Handlebars = require('handlebars');

  module.exports = flight.component(function searchResults() {
    this.defaultAttrs({
      searchSelector: "#search",
      helpSelector: ".help",
      helpTemplate: "Press <strong>Enter</strong> to find '<em>{{query}}</em>' on the map.",
      suggestedSelector: ".suggested",
      resultContainerSelector: "ul",
      resultSelector: "li",
      resultTemplate: '<li><strong>{{ organization_name }}</strong> ({{ address }})</li>'
    });

    this.showHelp = function(ev, options) {
      if (options.query) {
        this.select('helpSelector').html(
          Handlebars.compile(this.attr.helpTemplate)(options));
        this.trigger('uiShowSearchResults');
      } else {
        this.trigger('uiHideSearchResults');
      }
    };

    this.searchResults = function(ev, options) {
      var results = options.results,
          resultTemplate = Handlebars.compile(this.attr.resultTemplate),
          $container = this.select('resultContainerSelector');

      $container.empty();
      if (results.length) {
        _.each(results.slice(0, 5), function(result) {
          var html = resultTemplate(result.properties);
          $(html).data('result', result).appendTo($container);
        }, this);
        this.select('suggestedSelector').show();
        $container.show();
        this.trigger('uiShowSearchResults');
      } else {
        this.select('suggestedSelector').hide();
        $container.hide();
      }
    };

    this.selectedResult = function(ev) {
      ev.preventDefault();
      var $target = $(ev.target).closest(this.attr.resultSelector),
          display = $target.text(),
          result = $target.data('result');

      this.trigger('uiHideSearchResults');
      this.trigger(this.attr.searchSelector,
                   'uiShowingSearchResult',
                   {display: display});
      this.trigger(document, 'selectFeature', result);
    };

    this.showSearchResults = function(ev) {
      ev.preventDefault();
      this.$node.show();
    };

    this.hideSearchResults = function(ev) {
      ev.preventDefault();
      this.$node.hide();
    };

    this.after('initialize', function() {
      this.on(document, 'dataTypeaheadResults', this.searchResults);
      this.on(document, 'uiInProgressSearch', this.showHelp);
      this.on('uiShowSearchResults', this.showSearchResults);
      this.on('uiHideSearchResults', this.hideSearchResults);
      this.on('click', {
        resultSelector: this.selectedResult
      });
    });
  });
});
