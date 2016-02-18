define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var L = require('leaflet');
  var _ = require('lodash');
  var timedWithObject = require('timed_with_object');

  require('L.Control.Locate');
  require('leaflet.markercluster');

  module.exports = flight.component(function map() {
    this.attributes({
      tileUrl: 'http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}',
      tileAttribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
        this.cluster.options.disableClusteringAtZoom = mapConfig.maxZoom;
        this.cluster._maxZoom = mapConfig.maxZoom - 1;
      }
      if (mapConfig.maxBounds){
        this.map.setMaxBounds(mapConfig.maxBounds);
      }

      // set feature attribute to be used as preview text to config
      this.featurePreviewAttr = config.map.preview_attribute;

      // setup the center after we're done moving around
      this.map.setView(mapConfig.center, mapConfig.zoom);
    };

    this.loadData = function(ev, data) {
      this.defineIconStyles();

      var setupFeature = function(feature, layer) {
        this.layers[feature.id] = layer;

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
      geojson.addTo(this.cluster);
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
            if (object.removeLayers.length) {
              this.cluster.removeLayers(object.removeLayers);
            }
            if (object.addLayers.length) {
              this.cluster.addLayers(object.addLayers);
            } else {
              // add layers will trigger mapFinished, but if we don't add any
              // layers then we'll need to do it manually
              this.trigger('mapFinished', {});
            }
          }
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

    this.selectFeature = function(ev, feature) {
      if (this.previouslyClicked) {
        this.previouslyClicked.setIcon(this.defaultIcon);
        this.trigger(document, 'deselectFeature', this.currentFeature);
      }
      if (feature) {
        this.currentFeature = feature;
        var layer = this.layers[feature.id];
        layer.setIcon(this.grayIcon);
        this.previouslyClicked = layer;

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

    this.deselectFeature = function(ev, feature) {
      if (this.previouslyClicked) {
        this.previouslyClicked.setIcon(this.defaultIcon);
      }
      var layer = this.layers[feature.id];
      // re-bind popup to feature with specified preview attribute
      this.bindPopupToFeature(
        layer,
        feature.properties[this.featurePreviewAttr]);
      this.previouslyClicked = null;
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

    this.onBoundsChanged = function onBoundsChanged(e) {
      var map = e.target;
      var currentBounds = map.getBounds(),
          southWest = currentBounds.getSouthWest(),
          northEast = currentBounds.getNorthEast();
      this.trigger('mapBounds', {
        southWest: [southWest.lat, southWest.lng],
        northEast: [northEast.lat, northEast.lng]
      });
    };

    this.after('initialize', function() {
      this.map = L.map(this.node, {});

      this.cluster = new L.MarkerClusterGroup({
        chunkedLoading: true,
        chunkProgress: function(processed, total) {
          if (processed === total) {
            this.trigger('mapFinished', {});
          }
        }.bind(this)
      });
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

      this.map.on('moveend', this.onBoundsChanged.bind(this));

      this.on(document, 'config', this.configureMap);
      this.on(document, 'data', this.loadData);
      this.on(document, 'dataFiltered', this.filterData);

      this.on(document, 'selectFeature', this.selectFeature);
      this.on(document, 'deselectFeature', this.deselectFeature);
      this.on(document, 'hoverFeature', this.hoverFeature);
      this.on(document, 'clearHoverFeature', this.clearHoverFeature);
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
