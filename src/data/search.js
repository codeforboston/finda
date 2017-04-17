define(function(require) {
  'use strict';
  var flight = require('flight');
  var _  = require('lodash');
  var $ = require('jquery');

  return flight.component(function search() {
    this.defaultAttrs({
      searchUrl: '//nominatim.openstreetmap.org/search'
    });
    this.configureSearch = function(ev, config) {
      if (config.search && config.search.geosearch) {
        this.maxBounds = config.map.maxBounds;
      } else {
        this.teardown();
      }
    };

    this.onSearch = function(ev, options) {
      ev.preventDefault();
      var parameters = {
        // addressdetails: 1,
        format: "json",
        q: options.query,
        bounded: 1
      };
      if (this.maxBounds) {
        parameters.viewbox = [
          this.maxBounds[1][1], this.maxBounds[1][0],
          this.maxBounds[0][1], this.maxBounds[0][0]
        ].join(',');
      }
      $.getJSON(this.attr.searchUrl,
                parameters,
                this.searchResults.bind(this));
    };

    this.searchResults = function(results) {
      if (results.length) {
        var location = results[0],
            displayName = location.display_name;
        this.trigger('dataSearchResult', {
          name: displayName,
          lat: location.lat,
          lng: location.lon
        });
      }
    };

    this.after('initialize', function() {
      this.on(document, 'config', this.configureSearch);
      this.on(document, 'uiSearch', this.onSearch);
    });
  });
});
