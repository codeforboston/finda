define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  var _ = require('lodash');

  module.exports = flight.component(function project() {

    this.noteData = function(ev, data) { 
      this.data = data; 
    }

    this.doExport = function(ev) {
      var uri;
      ev.preventDefault();
      uri = 'data:text/plain,'+encodeURIComponent(JSON.stringify(this.data));
      window.open(uri, "Exported Finda Data")
    }

    this.after('initialize', function() {
      this.on(document, 'data', this.noteData);
      this.on('submit', this.doExport);
    });
  });
});
