define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  module.exports = flight.component(function loader() {
    this.after('initialize', function() {
      // load the data
      $.getJSON('config.json', function(config) {
        this.trigger('config', config);
      }.bind(this));
    });
  });
});
