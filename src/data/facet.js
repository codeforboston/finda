'use strict';
define(
  ['flight', 'lodash', 'jquery'],
  function(flight, _, $) {
    var facet = function() {
      this.configure = function(ev, config) {
        this.attr.config = config.facets;
        if (this.attr.data) {
          this.calculateFacets();
        }
      };

      this.loadData = function(ev, data) {
        this.attr.data = data;
        if (this.attr.config) {
          this.calculateFacets();
        }
      };

      this.calculateFacets = function() {
        var facetValues = _.mapValues(
          this.attr.config,
          function(facetConfig, facet) {
            return _.chain(this.attr.data.features)
              .map(function(feature) {
                return feature.properties[facet];
              })
              .flatten(true)
              .uniq()
              .sortBy(function(facet) { return facet.toLowerCase(); })
              .value();
          }, this);
        $(document).trigger('dataFacets', facetValues);
      };

      this.after('initialize', function() {
        this.on(document, 'config', this.configure);
        this.on(document, 'data', this.loadData);
      });
    };

    return flight.component(facet);
  });
