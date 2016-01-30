define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');

  module.exports = flight.component(function analytics() {
    this.feedback = function() {
      return this.$node.find('#feedback-text').val();
    };

    this.submitBtn = function() {
      return this.$node.find('.js-submit');
    };

    this.resetSubmitBtn = function() {
      this.submitBtn().html('Send');
    };

    this.addFeedbackToTagManager = function() {
      // track feedback in Google Tag Manager as a backup
      window.dataLayer.push({
        'eventLabel': this.feedback(),
      });
    };

    this.handleSubmission = function(e) {
      e.preventDefault();
      this.submitBtn().html('Sending...');
      this.addFeedbackToTagManager();

      // see google-apps-feedback-script.js
      $.ajax({
        url: 'https://script.google.com/macros/s/AKfycbzziKocYO7ZmbLvRaSI_OEFSHTVwnCFrTfQT-OzoqAVQvpg1ZE/exec',
        type: "post",
        data: {"feedback": this.feedback() },
        success: this.success.bind(this),
        error: this.error.bind(this)
      });
    };

    this.error = function(data) {
      this.resetSubmitBtn();
      var error = this.$node.find('.js-error');
      var body = this.feedback() + " (Error details: " + data.responseText + ")";
      error.find('.js-error-email').prop('href', 'mailto:gethelplex@lexingtonky.gov?subject=[GetHelpLex feedback]&body=' + body);
      error.show();
    };

    this.success = function() {
      this.resetSubmitBtn();
      this.$node.find('.js-thank-you').show();
      setTimeout(function() {
        this.$node.modal('hide');
        this.$node.find('.js-thank-you').hide();
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
