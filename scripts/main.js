define(
  ['leaflet',
   'infotemplates',
   'jquery',
   'leaflet-search',
   'leaflet.geosearch.provider.google'],
  function(L, createPopup) {

    var grayIcon, defaultIcon;

    var defineIconStyles = function() {
      // define icon styles
      var path = L.Icon.Default.imagePath;
      if (!path) {
        path = L.Icon.Default.imagePath = '/leaflet/images';
      }
      grayIcon = L.icon({
        iconUrl: path + "/marker-icon-gray.png"
      });

      defaultIcon = L.icon({
        iconUrl: path + "/marker-icon.png"
      });
    };

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

      if (!location.hash) {
        map.setView(config.center, config.zoom);
      }
      if (config.maxZoom){
        map.options.maxZoom = config.maxZoom;
      }
      if (config.maxBounds){
        map.setMaxBounds(config.maxBounds);
      }

      L.tileLayer('http://tiles.mapc.org/basemap/{z}/{x}/{y}.png', {
        attribution: 'Tiles Courtesy of <a href="http://mapc.org">MAPC</a> &mdash; Map data &copy; <a href="http://www.mass.gov/mgis/">MassGIS</a>',
        subdomains: '1234'
      }).addTo(map);

      return map;
    };

    return function(config, data) {
      defineIconStyles();
      var map = makeBaseMap(config.map);
      var info = makeInfoBox(config.properties, map);
      makeGeoSearch(map);

      // Leaflet doesn't keep track of these, but they're useful for testing
      map.layers = [];

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
        map.layers.push(layer);
        layer.on({ click: onClick });
      };

      L.geoJson(data, {onEachFeature: setupFeature}).addTo(map);
      //var facet = makeFacetBox(config.facets, map, geoLayer)

      map.locate({setView: true, maxZoom: 14}); //geolocate on load

      return map;
    };
  });
