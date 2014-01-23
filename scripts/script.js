'use strict';
require.config({
  baseUrl: "scripts/",
  paths: {
    "jquery": "dependencies/jquery-1.10.2",
    "leaflet": "../leaflet/leaflet",
    "handlebars": "dependencies/handlebars",
    "leaflet-search": "../leaflet/leaflet-search",
    "leaflet.control.geosearch": "../leaflet/l.control.geosearch",
    "leaflet.geosearch.provider.google": "../leaflet/l.geosearch.provider.google"
  },
  shim: {
    'handlebars': {
      exports: 'Handlebars'
    },
    'leaflet.geosearch': {
      exports: 'L'
    },
    'leaflet.geosearch.provider.google': {
      deps: ['leaflet.control.geosearch'],
      exports: 'L'
    }
  }
});

define(
  ['leaflet',
   'infotemplates',
   'jquery',
   'leaflet-search',
   'leaflet.geosearch.provider.google'],
  function(L, createPopup, $) {
    // define icon styles
    L.Icon.Default.imagePath = '/leaflet/images/';
    var grayIcon = L.icon({
      iconUrl: "leaflet/images/marker-icon-gray.png"
    });

    var defaultIcon = L.icon({
      iconUrl: "leaflet/images/marker-icon.png"
    });

    /*
     var makeFacetBox = function(config, map, data) {
     facetCounts = {};

     data.options.onEachFeature(function(feature, layer){

     });

     var facet = L.control();
     facet.setPosition("bottomleft");

     facet.onAdd = function () {
     return this._div = L.DomUtil.create('div', 'facet'); // create a div with a class "info"
     };

     facet.addTo(map);

     return facet;
     }
     */

    var makeGeoSearch = function(map){
      var geosearch = new L.Control.GeoSearch({
        provider: new L.GeoSearch.Provider.Google(),
        position: 'topleft',
        showMarker: false
      });

      geosearch.addTo(map);

      return geosearch;
    };

    var makeInfoBox = function(config, map){
      var info = L.control();

      info.onAdd = function () {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        return this._div;
      };

      info.update = function (featureProps) {
        this._div.innerHTML = createPopup(config, featureProps);
      };

      info.addTo(map);
      return info;
    };

    var makeBaseMap = function(config){
      var map = L.map('map', {zoomControl: false});

      if (config){
        if (!location.hash) {
          map.setView(config.center, config.zoom);
        }
        if (config.maxZoom){
          map.options.maxZoom = config.maxZoom;
        }
        if (config.maxBounds){
          map.setMaxBounds(config.maxBounds);
        }
      }
      //map.addHash();

      L.tileLayer('http://tiles.mapc.org/basemap/{z}/{x}/{y}.png', {
        attribution: 'Tiles Courtesy of <a href="http://mapc.org">MAPC</a> &mdash; Map data &copy; <a href="http://www.mass.gov/mgis/">MassGIS</a>',
        subdomains: '1234'
      }).addTo(map);

      return map;
    };

    $.getJSON("config.json", function(config) {
      var map = makeBaseMap(config.map);
      $.getJSON("data.geojson", function(data) {

        var info = makeInfoBox(config.properties, map);
        makeGeoSearch(map);

        var previouslyClicked;

        var onClick = function(e){
          map.panTo(e.latlng); //zoom to the clicked element
          info.update(e.target.feature.properties); //update infobox
          this.setIcon(grayIcon); // set the clicked marker to be gray

          // reset the previously clicked marker
          if(previouslyClicked){
            previouslyClicked.setIcon(defaultIcon);
          }

          previouslyClicked = this;
        };

        var setupFeature = function(feature, layer) {
          console.log(feature.properties.address);
          layer.on({ click: onClick });
        };

        L.geoJson(data, {onEachFeature: setupFeature}).addTo(map);
        //var facet = makeFacetBox(config.facets, map, geoLayer)

      });

      map.locate({setView: true, maxZoom: 14}); //geolocate on load
    });
  });
