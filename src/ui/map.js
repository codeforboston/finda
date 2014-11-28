define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var L = require('leaflet');
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
          this.$node.css('left', '+=' + addition);
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

      var setView = function() {
        if (!this.map) {
          return;
        }
        this.map.setView(mapConfig.center, mapConfig.zoom);
      };

      // setup the center after we're done moving around
      setView.call(this);
      window.setTimeout(setView.bind(this), 100);
    };

    this.loadData = function(ev, data) {
      this.defineIconStyles();

      var setupFeature = function(feature, layer) {
        this.layers[feature.id] = L.stamp(layer);

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

      if (this.layerGroup) {
        this.layers = {};

        this.cluster.removeLayer(this.layerGroup);
      }

      this.layerGroup = L.geoJson(data, {onEachFeature: setupFeature});
      this.layerGroup.addTo(this.cluster);
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
        var layerId = this.layers[feature.id],
            layer = this.layerGroup.getLayer(layerId);
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
      var layerId = this.layers[feature.id],
          layer = this.layerGroup.getLayer(layerId);
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
        var layerId = this.layers[feature.id],
            layer = this.layerGroup.getLayer(layerId);
        layer.openPopup();
      }
    };

    this.clearHoverFeature = function(ev, feature) {
      if (feature) {
        var layerId = this.layers[feature.id],
            layer = this.layerGroup.getLayer(layerId);
        layer.closePopup();
      }
    };

    this.panTo = function(ev, latlng) {
      this.map.panTo(latlng);
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
      this.on(document, 'dataFiltered', this.loadData);

      this.on(document, 'selectFeature', this.selectFeature);
      this.on(document, 'deselectFeature', this.deselectFeature);
      this.on(document, 'hoverFeature', this.hoverFeature);
      this.on(document, 'clearHoverFeature', this.clearHoverFeature);
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
