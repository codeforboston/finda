define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  var _ = require('lodash');

  module.exports = flight.component(function() {

    this.configure = function(ev, config) {
      this.reindexTimeoutSecs = config.edit_reindex_timeout_secs || 5;
    };

    this.loadData = function(ev, data) {
      this.data = data;
    };
    
    // Only way I can see to provide edited data back to the
    // *particular* other flight component that requested it is for it
    // to say what event it's listening for in response.  Large systems
    // have been built this way (it's what Erlang was built for), but it
    // still feels odd.

    this.provideEdits = function(ev, handlerEvent) {
      var copy = _.cloneDeep(this.data);
      var filtered = _.filter(copy.features, function(feature) {
        if (feature.deleted) {
          return false;
        }
        else {
          delete feature.deleted;
          return true;
        }
      });
      copy.features = filtered;
      this.lastExport = copy;   // for tests.  sigh...
      $(document).trigger(handlerEvent, copy);
    };

    this.newFeature = function(ev, feature) {
      this.data.features.push(feature);
      this.scheduleReindex();
    };

    // Should probably guard against selecting a feature that's not a point.

    this.selectFeature = function(ev, feature) {
      this.selectedFeature = feature;
    };

    this.selectedFeatureMoved = function(ev, pos) {
      if (this.selectedFeature) {
        this.selectedFeature.geometry.coordinates = pos;
        this.scheduleReindex();
      }
    };

    this.markDeletion = function() {
      if (this.selectedFeature) {
        this.selectedFeature.deleted = true;
      }
    };

    this.markUndeletion = function() {
      if (this.selectedFeature) {
        this.selectedFeature.deleted = false;
      }
    };

    this.propEdit = function(ev, newProps) {
      if (this.selectedFeature) {
        // Events may specify values for only *some* properties;
        // if so, we want to leave the others alone.
        $.extend(this.selectedFeature.properties, newProps);
        this.scheduleReindex();
      }
    };

    this.scheduleReindex = function() {
      if (this.reindexTimeout) {
        clearTimeout(this.reindexTimeout);
      }
      var trigger = function() {
        $(document).trigger('reindex', this.data);
      }.bind(this);
      this.reindexTimeout = setTimeout(trigger, 1000 * this.reindexTimeoutSecs);
    };

    this.after('initialize', function() {
      this.on(document, 'config', this.configure);
      this.on(document, 'data', this.loadData);
      this.on(document, 'requestEditedData', this.provideEdits);
      this.on(document, 'newFeature', this.newFeature);
      this.on(document, 'selectFeature', this.selectFeature);
      this.on(document, 'selectedFeatureMoved', this.selectedFeatureMoved);
      this.on(document, 'selectedFeaturePropsChanged', this.propEdit);
      this.on(document, 'selectedFeatureDeleted', this.markDeletion);
      this.on(document, 'selectedFeatureUndeleted', this.markUndeletion);
    });
  });
});
