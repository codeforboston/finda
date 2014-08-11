define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');

  module.exports = flight.component(function search() {
    this.defaultAttrs({
      searchSelector: 'input'
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

    this.after('initialize', function() {
      this.on('submit', this.search);
      this.on(document, 'config', this.configureSearch);
    });

    this.after('initialize', function() {
      this.on('submit', this.search);
      this.on(document, 'config', this.configureSearch);
      this.on(document, 'dataSearchResult', this.onSearchResult);
    });
  });
});
