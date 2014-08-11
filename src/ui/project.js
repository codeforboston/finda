define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  var _ = require('lodash');

  var stripHtml = function(html) {
    return $("<div/>").html(html).text();
  };

  module.exports = flight.component(function project() {
    this.configureProject = function(ev, config) {
      _.mapValues(
        config.project,
        function(value, key) {
          // find everything with data-project="key", and replace the HTML
          // with what's in the configuration
          $("*[data-project=" + key + "]").html(value);
          // set meta fields to the text value
          $("meta[name=" + key + "]").attr(
            'content', stripHtml(value));
        });
    };

    this.after('initialize', function() {
      this.on(document, 'config', this.configureProject);
    });
  });
});
