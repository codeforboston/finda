define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  var _ = require('lodash');
  var timedWithObject = require('timed_with_object');
  var L = require('leaflet');

  module.exports = flight.component(function facet() {
    this.configure = function(ev, config) {
      this.config = config.facets;
      this.selected = {};
      this.facetValues = null;
      this.facets = null;

    };

    this.loadData = function(ev, data) {
      this.initializeFacets(data);
    };

    this.filterFeatures = function(selected) {
      // given a set of selected facets, return a list of IDs that match the
      // selected features
      var ids;
      if (selected) {
        ids = _.chain(this.facetValues)
          .filter(
            function(facetValues) {
              return _.all(
                selected,
                function(selected, facet) {
                  var type = this.config[facet].type,
                      property = facetValues[facet];
                  if (type === 'map') {
                    if (!this.mapBounds) {
                      return false;
                    }
                    return this.mapBounds.contains(property);
                  }

                  if (!_.isArray(property)) {
                    property = [property];
                  }
                  // calculate the intersection of our selected values and
                  // the values on the given feature
                  var intersection = _.intersection(selected, property).length;
                  if (this.config[facet].type === 'list') {
                    // must match all of the values
                    return intersection === selected.length;
                  } else {
                    // must match any value
                    return intersection > 0;
                  }
                },
                this);
            },
            this)
          .map('id')
          .value();
      } else {
        ids = _.keys(this.facetValues);
      }
      return ids;
    };

    // returns a map of feature ID to the values for our facets
    this.identifyFacetValues = function(data) {
      return _.reduce(
        data.features,
        function(valueMap, feature) {
          var values = {
            id: feature.id
          };
          valueMap[feature.id] = values;
          _.mapValues(this.config, function(facetConfig, facet) {
            if (facetConfig.type === 'map') {
              values[facet] = L.latLng(
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0]
              );
            } else {
              values[facet] = feature.properties[facet];
            }
          });
          return valueMap;
        },
        {}, // valueMap
        this);
    };

    // returns an object with each facet, and a list of facet values
    this.identifyFacets = function() {
      return _.mapValues(
        this.config,
        function(facetConfig, facet) {
          // adds up the count of the values on the given facet
          return _.chain(this.facetValues)
            .map(function(values) {
              if (facetConfig.type === 'map') {
                if (facetConfig.value) {
                  this.selected[facet] = [facetConfig.text];
                }
                return [facetConfig.text];
              }
              return values[facet];
            }.bind(this))
            .flatten(true)
            .uniq()
            .sortBy(function(value) { return value.toLowerCase(); })
            .value();
        }.bind(this));
    };

    this.initializeFacets = function(data) {
      this.trigger('dataFilteringStarted', {});
      this.facetValues = this.identifyFacetValues(data);
      this.facets = this.identifyFacets();
      this.filterFacets(_.keys(this.facetValues));
    };

    this.filterFacets = function(ids) {
      var filteredCounts = {},
          finished = 0;

      var callback = function() {
        finished = finished + 1;
        if (finished === _.size(this.config)) {
          $(document).trigger('dataFacets', filteredCounts);
          this.trigger('dataFilteringFinished', {});
        }
      }.bind(this);

      _.mapValues(
        this.config,
        function(facetConfig, facet) {
          filteredCounts[facet] = {};
          var promise = this.filterSingleFacet(facet, facetConfig, ids);
          promise.then(function(counts) {
            filteredCounts[facet] = counts;
            callback();
          });
        },
        this);
    };

    this.filterSingleFacet = function(facet, facetConfig, ids) {
      var selectedValues = this.selected[facet] || [];
      var featureCount = ids.length;

      return timedWithObject(
        this.facets[facet],
        function(value, map) {
          var selected = _.contains(selectedValues, value),
              count;
          if (selected) {
            // if the value is already selected, then the count is
            // just the current count
            count = featureCount;
          } else {
            // otherwise, generate a new selection which includes
            // the value
            var selectedWithValue = _.clone(this.selected);
            selectedWithValue[facet] = _.union(
              selectedWithValue[facet],
              [value]);
            // and and filter the features with the new selection
            count = this.filterFeatures(selectedWithValue).length;
            // for non-list facets, adding a selection can increase
            // the number of features returned, but we actually
            // just want to show the number of additional features
            // that will be displayed
            if (facetConfig.type === 'single' &&
                selectedValues.length &&
                count >= featureCount) {
              count = count - featureCount;
            }
          }
          map.push({value: value,
                    count: count,
                    selected: selected
                   });
          return map;
        },
        [],
        this);
    };

    this.filterData = function(ev, params) {
      this.trigger('dataFilteringStarted', {});

      window.setTimeout(function() {
        if (params) {
          var facet = params.facet,
              selectedValues = params.selected;

          if (!selectedValues.length) {
            delete this.selected[facet];
          } else {
            this.selected[facet] = selectedValues;
          }
        }

        var ids = this.filterFeatures(this.selected);

        $(document).trigger('dataFiltered', {
          featureIds: ids
        });
        this.filterFacets(ids);
      }.bind(this), 0);
    };

    this.onMapBounds = function(ev, data) {
      this.mapBounds = L.latLngBounds(
        L.latLng(data.southWest),
        L.latLng(data.northEast));
      if (this.facetValues) {
        this.filterData();
      }
    };

    this.after('initialize', function() {
      this.on(document, 'config', this.configure);
      this.on(document, 'data', this.loadData);
      this.on(document, 'uiFilterFacet', this.filterData);
      this.on(document, 'mapBounds', this.onMapBounds);
    });
  });
});
