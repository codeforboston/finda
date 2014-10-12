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

    this.noteData = function(ev, data) { 

      // Squirrel away a copy of the whole in-core data block,
      // with the idea that it will be modified by subsequent
      // operations, and be available for export...

      this.data = data;
    }

    this.doExport = function(ev) {
      var uri, json;
      ev.preventDefault();
      json = JSON.stringify(this.data, undefined, 2);
      uri = 'data:text/plain,'+encodeURIComponent(json);
      window.open(uri, "Exported Finda Data")
    }

    this.after('initialize', function() {
      this.on(document, 'config', this.configure);
      this.on(document, 'data', this.noteData);
      this.on('submit', this.doExport);
    });
  });
});
