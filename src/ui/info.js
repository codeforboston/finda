define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  var templates = require('infotemplates');
  module.exports = flight.component(function info() {
    this.defaultAttrs({
      "contentClass": "content",
      "closeSelector": ".close"
    });

    this.configureInfo = function(ev, config) {
      this.infoConfig = config.properties;
    };

    this.update = function(ev, feature) {
      if (!feature) {
        return;
      }
      this.attr.currentFeature = feature;
      var popup = templates.popup(this.infoConfig,
                                  feature.properties);
      var content = this.$node.find("div." + this.attr.contentClass);
      if (!content.length) {
        content = $("<div/>").addClass(this.attr.contentClass).
          appendTo(this.$node);
      }
      content.html(popup);
      this.$node.show();
    };

    this.hide = function() {
      this.$node.hide();
      this.trigger(document, 'deselectFeature', this.attr.currentFeature);
      this.attr.currentFeature = null;
    };

    this.after('initialize', function() {
      this.on(document, 'config', this.configureInfo);
      this.on(document, 'selectFeature', this.update);
      this.on('click', {
        closeSelector: this.hide
      });
    });
  });
});
