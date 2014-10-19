define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var _ = require('lodash');
  var $ = require('jquery');

  module.exports = flight.component(function() {

    this.configure = function(ev, config) {
      // deep copy property info (so we can make notes w/o bothering anyone)
      this.property_info = $.extend(true, {}, config.properties);
    }

    this.loadData = function(ev, data) {
      this.data = data;
    }
    
    // Only way I can see to provide edited data back to the
    // *particular* other flight component that requested it is for it
    // to say what event it's listening for in response.  Large systems
    // have been built this way (it's what Erlang was built for), but it
    // still feels odd.

    this.provideEdits = function(ev, handlerEvent) {
      $(document).trigger(handlerEvent, this.data);
    }

    // Should probably guard against selecting a feature that's not a point.

    this.selectFeature = function(ev, feature) {
      this.selectedFeature = feature;
    }

    this.selectedFeatureMoved = function(ev, latlng) {
      if (this.selectedFeature) {
	this.selectedFeature.geometry.coordinates = [latlng.lng, latlng.lat];
      }
    }

    this.propEdit = function(ev, newProps) {
      if (this.selectedFeature) {
	// Events may specify values for only *some* properties;
	// if so, we want to leave the others alone.
	$.extend(this.selectedFeature.properties, newProps);
      }
    }

    this.after('initialize', function() {
      this.on(document, 'config', this.configure);
      this.on(document, 'data', this.loadData);
      this.on(document, 'requestEditedData', this.provideEdits);
      this.on(document, 'selectFeature', this.selectFeature);
      this.on(document, 'selectedFeatureMoved', this.selectedFeatureMoved);
      this.on(document, 'selectedFeaturePropsChanged', this.propEdit);
    });
  });
});
