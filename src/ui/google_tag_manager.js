define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');

  module.exports = flight.component(function analytics() {
    this.handleSubmission = function(e) {
      e.preventDefault();
      window.dataLayer.push({
        'eventLabel': this.$node.find('#feedback-text').val()
      });
      this.success();
    };

    this.success = function() {
      this.$node.find('.thank-you').show();
      setTimeout(function() {
        this.$node.modal('hide');
        this.$node.find('.thank-you').hide();
      }.bind(this), 2000);
    };

    this.handleCancel = function() {
      this.$node.modal('hide');
    };

    this.after('initialize', function() {
      this.on('#feedback-form', 'submit', this.handleSubmission);
      this.on('.btn-cancel', 'click', this.handleCancel);
    });
  });
});
