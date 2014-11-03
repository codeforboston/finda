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
          delete feature.undoInfo;
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
      this.sendUndoStatus(feature);
    };

    this.selectedFeatureMoved = function(ev, pos) {
      this.withUndoForSelectedFeature(function(feature) {
        feature.geometry.coordinates = pos;
      });
    };

    this.markDeletion = function() {
      this.withUndoForSelectedFeature(function(feature) {
        feature.deleted = true;
      });
    };

    this.markUndeletion = function() {
      this.withUndoForSelectedFeature(function(feature) {
        feature.deleted = false;
      });
    };

    this.propEdit = function(ev, newProps) {
      this.withUndoForSelectedFeature(function(feature) {
        // Events may specify values for only *some* properties;
        // if so, we want to leave the others alone.
        $.extend(feature.properties, newProps);
      });
    };

    this.withUndoForSelectedFeature = function(fn) {
      var feature = this.selectedFeature;
      if (feature) {
        this.prepForUndo(feature);
        fn(feature);
        this.sendUndoStatus(feature);
        this.scheduleReindex();
      }
    };

    this.prepForUndo = function(feature) {
      if (!feature.undoInfo) {
        feature.undoInfo = _.cloneDeep(this.extractUndoInfo(feature));
      }
    };

    this.sendUndoStatus = function(feature) {
      var deleted = feature.deleted;
      var undoInfo = feature.undoInfo;
      var changed = undoInfo && 
        !_.isEqual(undoInfo, this.extractUndoInfo(feature));

      $(document).trigger('selectedFeatureUndoStatus', 
                          deleted || changed || false);
    };
    
    this.extractUndoInfo = function(feature) {
      return { position: feature.geometry.coordinates,
               properties: feature.properties };
    };

    this.doUndo = function() {
      if (this.selectedFeature && this.selectedFeature.undoInfo) {
        var undo = this.selectedFeature.undoInfo;
        $(document).trigger('selectedFeatureUndeleted');
        $(document).trigger('selectedFeatureMoved', [undo.position]);
        $(document).trigger('selectedFeaturePropsChanged', undo.properties);
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
      this.on(document, 'requestUndo', this.doUndo);
      this.on(document, 'newFeature', this.newFeature);
      this.on(document, 'selectFeature', this.selectFeature);
      this.on(document, 'selectedFeatureMoved', this.selectedFeatureMoved);
      this.on(document, 'selectedFeaturePropsChanged', this.propEdit);
      this.on(document, 'selectedFeatureDeleted', this.markDeletion);
      this.on(document, 'selectedFeatureUndeleted', this.markUndeletion);
    });
  });
});
