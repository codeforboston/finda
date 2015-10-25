define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');

  module.exports = flight.component(function sidebar() {
    this.after('initialize', function() {
      this.on(document, 'uiShowResults', function() {
        this.$node.find('#results-tab').click();
        this.$node.find('.survey-tabs').removeClass('survey-tabs');
      });
    });
  });
});
