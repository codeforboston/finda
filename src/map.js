'use strict';
define(
  ['leaflet',
   'mapbox',
   'jquery',
   'flight'],
  function(L, $, flight) {
    var map = L.mapbox.map('map', 'examples.map-4l7djmvo');

    map.defineIconStyles = function() {
      // define icon styles
      var path = L.Icon.Default.imagePath;
      if (!path) {
        path = L.Icon.Default.imagePath = 'lib/leaflet/images';
      }
      this.grayIcon = L.icon({
        iconUrl: path + '/marker-icon-gray.png'
      });

      this.defaultIcon = L.icon({
        iconUrl: path + '/marker-icon.png'
      });
    };

    map.configureMap = function(ev, config) {
      var mapConfig = config.map;
      this.map.setView(mapConfig.center, mapConfig.zoom);
      if (mapConfig.maxZoom){
        this.map.options.maxZoom = mapConfig.maxZoom;
      }
      if (mapConfig.maxBounds){
        this.map.setMaxBounds(mapConfig.maxBounds);
      }
      // geolocate once the configuration is set
      this.map.locate({setView: true, maxZoom: mapConfig.zoom});
    };

    map.loadData = function(ev, data) {
      this.defineIconStyles();

      var setupFeature = function(feature, layer) {
        this.layers.push(layer);
        layer.on({click: this.emitClick.bind(this)});
      }.bind(this);

      L.geoJson(data, {onEachFeature: setupFeature}).addTo(this.map);
    };

    map.emitClick = function(e) {
      this.trigger(document, 'selectFeature', e.target.feature);

      if (this.previouslyClicked) {
        this.previouslyClicked.setIcon(this.defaultIcon);
      }

      e.target.setIcon(this.grayIcon);
      this.previouslyClicked = e.target;
    };

    map.selectFeature = function(ev, feature) {
      this.trigger('panTo', {lng: feature.geometry.coordinates[0],
                             lat: feature.geometry.coordinates[1]});
    };

    map.panTo = function(ev, latlng) {
      this.map.panTo(latlng);
    };

    map.after('initialize', function() {
      this.map = L.map(this.node, {zoomControl: false});

      this.layers = [];

      L.tileLayer(this.attr.tileUrl, {
        attribution: this.attr.tileAttribution,
        subdomains: this.attr.tileSubdomains
      }).addTo(this.map);

      this.on(document, 'config', this.configureMap);
      this.on(document, 'data', this.loadData);

      this.on(document, 'selectFeature', this.selectFeature);
      this.on('panTo', this.panTo);
    });

    return flight.component(map);
  });
