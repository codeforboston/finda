define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  var _ = require('lodash');
 
  module.exports = flight.component(function selectCounty() {
    this.loadData = function(ev, data) {
      var counties = _.map(data.features, function(feature) {
        if (_.isString(feature.properties.county)) {
          return feature.properties.county.trim();
        }
      });
      counties = _.uniq(counties);
      counties = _.compact(counties);
      counties = _.sortBy(counties);
    
      counties.forEach(function(county) {
        this.$node.append($("<option/>").html(county).attr('value', county))
      }.bind(this));
    };
    
    this.onCountySelected = function onCountySelected(e) {
      var county = $(this.$node).val();
      var selected = [];
      if (county) {
        selected.push(county);
      }
      $(document).trigger('uiFilterFacet', {
        facet: "county",
        selected: selected
      });
    };

    this.after('initialize', function() {
      this.on(document, 'data', this.loadData);
      this.on('change', this.onCountySelected);
    });
  });
});
