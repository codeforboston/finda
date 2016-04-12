define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');

  module.exports = flight.component(function() {

    this.onScroll = function() {
      if (this.$node.scrollTop() >= 500) {
        $('#back-to-top').fadeIn(200);
      } else {
        $('#back-to-top').fadeOut(200);
      }
    };

    this.after('initialize', function() {
      this.on('scroll', this.onScroll);
    });
  });
});