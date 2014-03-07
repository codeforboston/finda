define(
  ['flight',
   'jquery',
   'infotemplates'],
  function(flight, $, templates) {
    'use strict';
    var info = function() {
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
        $(document).trigger('selectFeature', null);
      };

      this.after('initialize', function() {
        this.on(document, 'config', this.configureInfo);
        this.on(document, 'selectFeature', this.update);
        this.on(this.select('closeSelector'), 'click', this.hide);
      });
    };

    return flight.component(info);
  });
