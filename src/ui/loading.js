define(function(require) {
  'use strict';
  var flight = require('flight');
  require('bootstrap');

  return flight.component(function loading() {
    this.attributes({
      contentSelector: 'h4',
      loadingText: 'Loading...',
      filteringText: 'Filtering...'
    });

    var showCount = 0;

    this.showLoading = function() {
      this.show(this.attr.loadingText);
    };

    this.showFiltering = function() {
      this.show(this.attr.filteringText);
    };

    this.show = function(content) {
      showCount = showCount + 1;
      if (showCount === 1) { // first show
        this.select('contentSelector').text(content);
        this.$node.modal({
          keyboard: false
        });
      }
    };

    this.hide = function() {
      showCount = showCount - 1;
      if (showCount === 0) {
        this.$node.modal('hide');
      }
    };

    this.after('initialize', function() {
      showCount = 0;
      this.on(document, 'mapStarted', this.showLoading);
      this.on(document, 'mapFilteringStarted', this.showFiltering);
      this.on(document, 'mapFinished', this.hide);

      this.on(document, 'listStarted', this.showLoading);
      this.on(document, 'listFilteringStarted', this.showFiltering);
      this.on(document, 'listFinished', this.hide);

      this.on(document, 'dataFilteringStarted', this.showFiltering);
      this.on(document, 'dataFilteringFinished', this.hide);
    });
  });
});
