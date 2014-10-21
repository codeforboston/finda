define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  var _ = require('lodash');

  module.exports = flight.component(function () {

    this.configure = function(ev, config) {
      if (!config.edit_mode) {
        this.$node.hide();
      }
    }

    this.triggerExport = function(ev) {
      ev.preventDefault();
      $(document).trigger('requestEditedData', 'editedDataForSave');
    }

    this.doExport = function(ev, data) {
      var json = JSON.stringify(data, undefined, 2);
      var uri = 'data:text/plain,'+encodeURIComponent(json);
      window.open(uri, "Exported Finda Data")
    }

    this.after('initialize', function() {
      this.on(document, 'config', this.configure);
      this.on(document, 'editedDataForSave', this.doExport);
      this.on('click', this.triggerExport);
    });
  });
});
