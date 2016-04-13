define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');

  module.exports = flight.component(function() {
    this.onClick = function() {
      $('body,html').animate({
        scrollTop: 0
      }, 1000);
		return false;
    };

    this.after('initialize', function() {
      this.on('click', this.onClick);
    });
  });
});