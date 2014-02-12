'use strict';
define(
  ['flight', 'lodash'],
  function(flight, _) {
    var facet = function() {
      this.configure = function(ev, config) {
        this.attr.config = config.facets;
      };

      this.loadData = function(ev, data) {
        this.attr.data = data;
        this.attr.facets = _.mapValues(
          this.attr.config,
          function(facetConfig, facet) {
            return _.chain(this.attr.data.features)
              .map(function(feature) {
                return feature.properties[facet];
              })
              .flatten(true)
              .uniq()
              .value();
          }, this);
      };

      this.after('initialize', function() {
        this.on(document, 'config', this.configure);
        this.on(document, 'data', this.loadData);
      });
    };

    return flight.component(facet);
  });
