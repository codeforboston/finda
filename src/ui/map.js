define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  var L = require('leaflet');
  var _ = require('lodash');
  var timedWithObject = require('timed_with_object');

  require('L.Control.Locate');
  require('leaflet.markercluster');

  module.exports = flight.component(function map() {
    this.defaultAttrs({
      tileUrl: 'http://a{s}.acetate.geoiq.com/tiles/acetate-hillshading/{z}/{x}/{y}.png',
      tileAttribution: '&copy;2012 Esri & Stamen, Data from OSM and Natural Earth',
      tileSubdomains: '0123',
      tileMinZoom: 2,
      tileMaxZoom: 18
    });

    this.defineIconStyles = function() {
      // define icon styles
      var path = L.Icon.Default.imagePath;
      if (!path) {
        path = L.Icon.Default.imagePath = 'lib/leaflet/images';
      }
      this.grayIcon = L.icon({
        iconUrl: path + '/marker-icon-gray.png',
        shadowUrl: path + '/marker-shadow.png'
      });

      this.defaultIcon = L.icon({
        iconUrl: path + '/marker-icon.png',
        shadowUrl: path + '/marker-shadow.png'
      });
    };

    this.configureMap = function(ev, config) {
      this.trigger('mapStarted', {});
      // if list or facets are emabled, give the map less space
      var addition = 0;
      if (config.facets) {
        addition += 300;
      }
      if (config.list) {
        addition += 300;
      }

      if (addition > 0) {
        window.setTimeout(function() {
          if (this.map) {
            this.$node.css('left', '+=' + addition);
            this.map.invalidateSize();
          }
        }.bind(this), 50);
      }

      var mapConfig = config.map;

      if (mapConfig.maxZoom){
        this.map.options.maxZoom = mapConfig.maxZoom;
      }
      if (mapConfig.maxBounds){
        this.map.setMaxBounds(mapConfig.maxBounds);
      }

      // set feature attribute to be used as preview text to config
      this.featurePreviewAttr = config.map.preview_attribute;
      this.newPointAddrAttr = config.map.new_point_address_attribute;

      // Determine whether edit-mode features are enabled (particularly
      // dragging selected feature).
      this.edit_mode = config.edit_mode;

      if (this.edit_mode) {
        var label = config.new_feature_popup_label;
        if (label !== undefined) {
          $("#new-feature-popup-label").html(label);
        }
      }

      // setup the center after we're done moving around
      this.map.setView(mapConfig.center, mapConfig.zoom);
    };

    this.loadData = function(ev, data) {
      this.defineIconStyles();

      var setupFeature = function(feature, layer) {
        this.layers[feature.id] = layer;

        // Want to be able to enable dragging in edit mode, but not yet...
        // layer.dragging.disable();

        // bind popup to feature with specified preview attribute
        this.bindPopupToFeature(
          layer,
          feature.properties[this.featurePreviewAttr]);

        layer.on({
          click: this.emitClick.bind(this),
          mouseover: this.emitHover.bind(this),
          mouseout: this.clearHover.bind(this)
        });
      }.bind(this);

      this.layers = {};

      var geojson = L.geoJson(data, {onEachFeature: setupFeature});
      if (data.features.length < 1000) {
        window.setTimeout(function() {
          geojson.addTo(this.cluster);
          this.trigger('mapFinished', {});
        }.bind(this), 25);
      } else {
        // break the load into pieces to avoid timeouts
        timedWithObject(
          _.values(geojson._layers),
          function(layer, cluster) {
            cluster.addLayer(layer);
            return cluster;
          },
          this.cluster).then(function() {
            this.trigger('mapFinished', {});
          }.bind(this));
      }

      if (this.edit_mode) {
        this.map.doubleClickZoom.disable();
        this.map.on('dblclick', this.emitStartCreate.bind(this));
      }
    };

    this.filterData = function(e, data) {
      var object = {
        keepLayers: [],
        addLayers: [],
        removeLayers: []
      };
      this.trigger('mapFilteringStarted', {});
      timedWithObject(
        _.pairs(this.layers),
        function(pair, object) {
          var featureId = pair[0],
              layer = pair[1],
              selected = _.contains(data.featureIds, featureId),
              hasLayer = this.cluster.hasLayer(layer);
          if (selected) {
            object.keepLayers.push(layer);
          }
          if (hasLayer && !selected) {
            object.removeLayers.push(layer);
          } else if (!hasLayer && selected) {
            object.addLayers.push(layer);
          }
          return object;
        },
        object,
        this).then(function(object) {
          // rough level at which it's faster to remove all the layers and just
          // add the ones we want
          if (object.removeLayers.length > 1000) {
            this.cluster.clearLayers();
            this.cluster.addLayers(object.keepLayers);
          } else {
            if (object.addLayers.length) {
              this.cluster.addLayers(object.addLayers);
            }
            if (object.removeLayers.length) {
              this.cluster.removeLayers(object.removeLayers);
            }
          }
          this.trigger('mapFinished', {});
        }.bind(this));
    };

    this.emitClick = function(e) {
      this.trigger(document, 'selectFeature', e.target.feature);
    };

    this.emitHover = function(e) {
      this.trigger(document, 'hoverFeature', e.target.feature);
    };

    this.clearHover = function(e) {
      this.trigger(document, 'clearHoverFeature', e.target.feature);
    };

    this.emitStartCreate = function(e) {
      this.trigger(document, 'startCreateFeature',
                   { position: e.latlng, attrs: {} });
    };

    this.selectFeature = function(ev, feature) {
      if (this.previouslyClicked) {
        if (this.previouslyClicked.dragging) {
          this.previouslyClicked.dragging.disable();
        }
        this.previouslyClicked.setIcon(this.defaultIcon);
        this.trigger(document, 'deselectFeature', this.currentFeature);
      }
      if (feature) {
        this.currentFeature = feature;
        var layer = this.layers[feature.id];
        layer.setIcon(this.grayIcon);
        this.previouslyClicked = layer;

        if (this.edit_mode) {
          this.map.addLayer(layer); // if it was buried in a cluster...
          layer.dragging.enable();
          layer.on("dragend", function(ev) {
            var latlng = ev.target.getLatLng();
            var pos = [latlng.lng, latlng.lat];
            this.attr.features[pos] = layer;
            this.trigger(document, 'selectedFeatureMoved', [pos]);
          }.bind(this));
        }

        // re-bind popup to feature with specified preview attribute
        this.bindPopupToFeature(
          layer,
          feature.properties[this.featurePreviewAttr]);

        this.trigger('panTo', {lng: feature.geometry.coordinates[0],
                               lat: feature.geometry.coordinates[1]});
      } else {
        this.previouslyClicked = null;
      }
    };

    this.selectedFeatureMoved = function(ev, pos) {
      if (this.previouslyClicked) {
        var oldLatLng = this.previouslyClicked.getLatLng();
        if (oldLatLng.lat !== pos[1] || oldLatLng.lng !== pos[0]) {
          var latlng = L.latLng(pos[1], pos[0]);
          this.previouslyClicked.setLatLng(latlng);
          this.map.panTo(latlng);
        }
      }
    };

    this.deselectFeature = function(ev, feature) {
      if (this.previouslyClicked) {
        if (this.previouslyClicked.dragging) {
          this.previouslyClicked.dragging.disable();
        }
        this.previouslyClicked.setIcon(this.defaultIcon);
      }
      var layer = this.layers[feature.id];
      // re-bind popup to feature with specified preview attribute
      // NB if value of preview attr has changed in edit, this is
      // where the map picks it up.
      this.bindPopupToFeature(
        layer,
        feature.properties[this.featurePreviewAttr]);
      this.previouslyClicked = null;
    };

    this.markDeletion = function() {
      if (this.previouslyClicked) {
        this.previouslyClicked.setOpacity(0.4);
      }
    };

    this.markUndeletion = function() {
      if (this.previouslyClicked) {
        this.previouslyClicked.setOpacity(1.0);
      }
    };

    this.bindPopupToFeature = function(layer, feature){
      layer.bindPopup(
        feature,
        {
          closeButton: false,
          offset: L.point(0, -40)
        });
    };

    this.hoverFeature = function(ev, feature) {
      if (feature) {
        var layer = this.layers[feature.id];
        layer.openPopup();
      }
    };

    this.clearHoverFeature = function(ev, feature) {
      if (feature) {
        var layer = this.layers[feature.id];
        layer.closePopup();
      }
    };

    this.panTo = function(ev, latlng) {
      this.map.panTo(latlng);
    };

    // Managing the two-step process of creating a new feature.
    // (It's two steps, with the simple form in a popup, so stray
    // double-clicks are easy to undo.)

    // Start create: sets up the "new-feature" popup at the right location.

    this.startCreate = function(e, data) {
      var popup = L.popup();
      this.createPopup = popup;
      this.createAddress = data.address;
      popup.setLatLng(data.position);
      popup.setContent($("#new-feature-popup").html());
      popup.openOn(this.map);

      var form = this.$node.find('.create-feature-popup-form');
      form.on('submit', this.finishCreate.bind(this));
      form.find('input').first().focus();
    };

    // Finish create: handles ordinary submission of the form in the
    // "startCreate" popup.

    this.finishCreate = function(e) {
      e.preventDefault();

      var popup = this.createPopup; // stashed away in step 1 above
      if (popup === undefined) {
        // Ordinarily "can't happen", but the test framework leaves old
        // map components lying around.  The finishCreate tests only create
        // a mock popup on the one set up for them, and we need to keep
        // the others from blowing up.  (All due to the use of a 'live'
        // event handler declaration below.)
        return;
      }

      var latlng = popup.getLatLng();

      var props = {};
      props[this.featurePreviewAttr] = $(e.target).serializeArray()[0].value;
      if (this.newPointAddrAttr) {
        props[this.newPointAddrAttr] = this.createAddress;
      }

      var feature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [latlng.lng, latlng.lat]
        },
        properties: props
      };

      this.lastCreatedFeature = feature; // for tests (only! no other use!)

      this.map.removeLayer(popup); // don't need it any longer...
      $(document).trigger('newFeature', feature);
      $(document).trigger('selectFeature', feature);
    };

    this.handleNewFeature = function(e, feature) {
      this.attr.layer.addData(feature);
    };

    this.onSearchResult = function(ev, result) {
      if (!this.searchMarker) {
        this.searchMarker = L.marker(result, {
          icon: L.divIcon({className: 'search-result-marker'})
        });
        this.searchMarker.addTo(this.map);
      } else {
        this.searchMarker.setLatLng(result);
      }

      this.trigger('panTo',
                   {lat: result.lat,
                    lng: result.lng});
    };

    this.after('initialize', function() {
      this.map = L.map(this.node, {})
;
      this.cluster = new L.MarkerClusterGroup();
      this.cluster.addTo(this.map);

      L.control.scale().addTo(this.map);
      // Add the location control which will zoom to current
      // location
      L.control.locate().addTo(this.map);


      this.layers = {};

      L.tileLayer(this.attr.tileUrl, {
        attribution: this.attr.tileAttribution,
        subdomains: this.attr.tileSubdomains,
        minZoom: this.attr.tileMinZoom,
        maxZoom: this.attr.tileMaxZoom
      }).addTo(this.map);

      this.on(document, 'config', this.configureMap);
      this.on(document, 'data', this.loadData);
      this.on(document, 'dataFiltered', this.filterData);

      this.on(document, 'selectFeature', this.selectFeature);
      this.on(document, 'deselectFeature', this.deselectFeature);
      this.on(document, 'hoverFeature', this.hoverFeature);
      this.on(document, 'clearHoverFeature', this.clearHoverFeature);
      this.on(document, 'selectedFeatureMoved', this.selectedFeatureMoved);
      this.on(document, 'selectedFeatureDeleted', this.markDeletion);
      this.on(document, 'selectedFeatureUndeleted', this.markUndeletion);
      this.on(document, 'startCreateFeature', this.startCreate);
      this.on(document, 'newFeature', this.handleNewFeature);
      this.on(document, 'dataSearchResult', this.onSearchResult);
      this.on('panTo', this.panTo);
    });

    this.before('teardown', function() {
      if (this.map) {
        this.map.remove();
        this.map = undefined;
      }
    });
  });
});
