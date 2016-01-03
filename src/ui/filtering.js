define(function(require) {
  'use strict';
  var flight = require('flight');
  require('bootstrap');

  return flight.component(function filtering() {
    this.attributes({
      contentSelector: '#message'
    });

    this.toggle = function() {
      this.$node.toggle();
    };

    this.after('initialize', function() {
      this.on(document, 'dataFilteringStarted', this.toggle);
      this.on(document, 'dataFilteringFinished', this.toggle);
    });
  });
});
