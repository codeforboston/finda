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
        format: "json",
        addressdetails: 1,
        q: options.query
      };
      if (this.maxBounds) {
        parameters.viewbox = [
          this.maxBounds[0][0], this.maxBounds[0][1],
          this.maxBounds[1][0], this.maxBounds[1][1]
        ].join(',');
      }
      $.getJSON(this.attr.searchUrl,
                parameters,
                this.searchResults.bind(this));
    };

    this.searchResults = function(results) {
      if (results.length) {
        var location = results[0],
            displayName = _.compact([location.address.road,
                                     location.address.city,
                                     location.address.state
                                    ]).join(', ');
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
