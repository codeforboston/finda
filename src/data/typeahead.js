define(function(require) {
  'use strict';
  var flight = require('flight');
  var _  = require('lodash');
  var Fuse = require('fuse');

  return flight.component(function typeahead() {
    this.configureSearch = function(ev, config) {
      if (config.search && config.search.full_text) {
        this.options = config.search.full_text;
      } else {
        this.teardown();
      }
    };

    this.createFuse = function(ev, data) {
      var options = _.clone(this.options);
      // convert the keys to something that works with the features from the
      // GeoJSON
      options.keys = _.map(options.keys, function(key) {
        return 'properties.' + key;
      });
      this.fuse = new Fuse(data.features,
                           options);
    };

    this.updateSearch = function(ev, options) {
      if (!this.options || !this.fuse) {
        return;
      }
      var results = this.fuse.search(options.query);
      this.trigger(document, 'dataTypeaheadResults', {results: results});
    };

    this.after('initialize', function() {
      this.on(document, 'config', this.configureSearch);
      this.on(document, 'data', this.createFuse);
      this.on(document, 'uiInProgressSearch', this.updateSearch);
    });
  });
});
