define(
  ['flight', 'lodash', 'jquery'],
  function(flight, _, $) {
    'use strict';
    var facet = function() {
      this.configure = function(ev, config) {
        this.attr.config = config.facets;
        this.attr.selected = {};
        if (this.attr.data) {
          this.calculateFacets();
        }
      };

      this.loadData = function(ev, data) {
        if (!this.attr.data) {
          this.attr.data = data;
          if (this.attr.config) {
            this.calculateFacets();
          }
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
              .reduce(function(counts, facet) {
                if (!counts[facet]) {
                  counts[facet] = 1;
                } else {
                  counts[facet] = counts[facet] + 1;
                }
                return counts;
              }, {})
              .map(function(count, facet) {
                return {facet: facet, count: count};
              })
              .sortBy(function(facet) { return facet.facet.toLowerCase(); })
              .value();
          }, this);
        $(document).trigger('dataFacets', facetValues);
      };

      this.filterData = function(ev, params) {
        var facet = params.facet,
            selectedValues = params.selected;
        if (!selectedValues.length) {
          delete this.attr.selected[facet];
        } else {
          this.attr.selected[facet] = selectedValues;
        }
        var geojson = this.attr.data;
        if (this.attr.selected) {
          var features = _.filter(
            this.attr.data.features,
            function(feature) {
              return _.all(
                this.attr.selected,
                function(selected, key) {
                  var property = feature.properties[key];
                  if (!_.isArray(property)) {
                    return _.contains(selected, property);
                  } else {
                    var intersection = _.intersection(selected, property);
                    return intersection.length >= selected.length;
                  }
                });
            }, this);
          geojson = _.defaults({features: features}, this.attr.data);
        }
        $(document).trigger('dataFiltered', geojson);
      };

      this.after('initialize', function() {
        this.on(document, 'config', this.configure);
        this.on(document, 'data', this.loadData);
        this.on(document, 'uiFilterFacet', this.filterData);
      });
    };

    return flight.component(facet);
  });
