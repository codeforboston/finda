define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');

  module.exports = flight.component(function search() {

    this.configure = function(ev, config) {
      if (config.search && config.search.geosearch && config.edit_mode) {
        this.$node.show();
      } else {
        this.$node.hide();
      }
    };

    this.search = function(ev) {
      ev.preventDefault();
      var address = $('#search input').val();
      if (address) {
        this.trigger(document, 'uiSearch', {query: address,
                                            responseEvent: 'addSiteAddr'});
      }
    };

    this.onSearchResult = function(ev, result) {
      var address = $('#search input').val();
      var latlng = {lat: result.lat, lng: result.lng};
      var props = {position: latlng, address: address};
      this.trigger(document, 'startCreateFeature', props);
    };

    this.after('initialize', function() {
      this.on('click', this.search);
      this.on(document, 'config', this.configure);
      this.on(document, 'addSiteAddr', this.onSearchResult);
    });
  });
});
