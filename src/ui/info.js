define(
  ['flight',
   'infotemplates'],
  function(flight, templates) {
    'use strict';
    var info = function() {

      this.configureInfo = function(ev, config) {
        this.infoConfig = config.properties;
      };

      this.update = function(ev, feature) {
        var popup = templates.popup(this.infoConfig,
                                    feature.properties);
        this.$node.empty().html(popup)
          .show();
      };

      this.after('initialize', function() {
        this.on(document, 'config', this.configureInfo);
        this.on(document, 'selectFeature', this.update);
      });
    };

    return flight.component(info);
  });
