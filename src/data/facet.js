define(
  ['flight', 'lodash', 'jquery'],
  function(flight, _, $) {
    'use strict';
    var facet = function() {
      this.configure = function(ev, config) {
        this.attr.config = config.facets;
        this.attr.selected = {};
        this.attr.facets = {};
        if (this.attr.data) {
          this.initializeFacets();
        }
      };

      this.loadData = function(ev, data) {
        if (!this.attr.data) {
          this.attr.data = data;
          if (this.attr.config) {
            this.initializeFacets();
          }
        }
      };

      // returns an object with each facet, and the count of the facet values
      this.countFacets = function(data) {
        return _.mapValues(
          this.attr.config,
          _.bind(function(facetConfig, facet) {
            // adds up the count of the values on the given facet
            return _.chain(data.features)
              .map(function(feature) {
                return feature.properties[facet];
              })
              .flatten(true)
              .reduce(function(counts, value) {
                if (!counts[value]) {
                  counts[value] = 1;
                } else {
                  counts[value] = counts[value] + 1;
                }
                return counts;
              }, {})
              .value();
          }, this));
      };

      this.initializeFacets = function() {
        this.attr.facets = this.countFacets(this.attr.data);
        this.filterFacets(this.attr.data);
      };

      this.filterFacets = function(data) {
        var selectedFacets = this.attr.selected,
            facets = this.attr.facets,
            facetCounts = this.countFacets(data),
            filteredCounts = _.mapValues(
              this.attr.config,
              _.bind(function(facetConfig, facet) {
                var counts = facetCounts[facet],
                    selected = selectedFacets[facet];
                return _.chain(facets[facet])
                  .map(function(initialCount, value) {
                    var count;
                    if (facetConfig.type === 'list') {
                      count = counts[value] || 0;
                    } else {
                      count = initialCount;
                    }
                    return {value: value,
                            count: count,
                            selected: _.contains(selected, value)
                           };
                  })
                  .sortBy(function(o) { return o.value.toLowerCase(); })
                  .value();
              }, this));
        $(document).trigger('dataFacets', filteredCounts);
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
                _.bind(function(selected, key) {
                  var property = feature.properties[key];
                  if (!_.isArray(property)) {
                    property = [property];
                  }
                  var intersection = _.intersection(selected, property);
                  if (this.attr.config[key].type === 'list') {
                    // must match all of the values
                    return intersection.length >= selected.length;
                  } else {
                    // must match any value
                    return intersection.length > 0;
                  }
                }, this));
            }, this);
          geojson = _.defaults({features: features}, this.attr.data);
        }
        $(document).trigger('dataFiltered', geojson);
        this.filterFacets(geojson);
      };

      this.after('initialize', function() {
        this.on(document, 'config', this.configure);
        this.on(document, 'data', this.loadData);
        this.on(document, 'uiFilterFacet', this.filterData);
      });
    };

    return flight.component(facet);
  });
