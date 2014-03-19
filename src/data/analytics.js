define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  var _ = require('lodash');
  $("<script/>")
    .attr('type', 'text/javascript')
    .attr('src', '//www.google-analytics.com/analytics.js')
    .appendTo('head');

  module.exports = flight.component(function analytics() {
    this.defaultAttrs({
      codeForBostonTracker: "UA-37610225-5",
      enabled: true,
      detailEnabled: true
    });

    this.track = function() {
      if (_.isFunction(window.ga)) {
        window.ga.apply(this, arguments);
      } else {
        if (!window.ga) {
          window.GoogleAnalyticsObject = 'ga';
          window.ga = { q: [], l: Date.now() };
        }
        window.ga.q.push(arguments);
      }
    };

    this.trackAll = function(command) {
      if (!this.attr.enabled) {
        return;
      }
      var args = Array.prototype.slice.apply(arguments).slice(1);
      _.each(
        this.trackers,
        function(tracker) {
          var subCommand = tracker + '.' + command;
          this.track.apply(this, [subCommand].concat(args));
        },
        this);
    };

    this.configureAnalytics = function(ev, config) {
      this.attr.enabled = config.analytics.enabled;
      if (!this.attr.enabled) {
        return;
      }

      this.attr.detailEnabled = config.analytics.detail_enabled;

      var hostname = window.location.hostname;
      if (_.isString(config.analytics.hostname)) {
        hostname = config.analytics.hostname;
      }

      var trackers = [];
      if (!config.analytics['private']) {
        trackers.push('cfb');
        this.track("create", this.attr.codeForBostonTracker, hostname,
                   {name: 'cfb'});
      }
      if (config.analytics.google_tracker) {
        trackers.push('user');
        this.track("create", config.analytics.google_tracker, hostname,
                   {name: 'user'});
      }
      this.trackers = trackers;
      this.trackAll("send", "pageview");
    };

    this.trackFacet = function(ev, facets) {
      var detail = null;
      if (this.attr.detailEnabled) {
        detail = JSON.stringify(facets);
      }
      this.trackAll('send', 'event', 'click', 'facets', detail);
    };

    this.trackFeature = function(ev, feature) {
      var detail = null;
      if (this.attr.detailEnabled) {
        detail = feature.geometry.coordinates.join(',');
      }
      this.trackAll('send', 'event', 'click', 'feature', detail);
    };

    this.trackSearch = function(ev, search) {
      var detail = null;
      if (this.attr.detailEnabled) {
        detail = search.query;
      }
      this.trackAll('send', 'event', 'click', 'search', detail);
    };

    this.after('initialize', function() {
      this.on(document, 'config', this.configureAnalytics);
      this.on(document, 'selectFeature', this.trackFeature);
      this.on(document, 'uiFilterFacet', this.trackFacet);
      this.on(document, 'uiSearch', this.trackSearch);
    });
  });
});
