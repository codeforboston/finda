'use strict';

// define icon styles
var grayIcon = L.icon({
    iconUrl: "leaflet/images/marker-icon-gray.png"   
});

var defaultIcon = L.icon({
    iconUrl: "leaflet/images/marker-icon.png"   
});

console.log('loading config');
L.Util.ajax('config.json').then(function(config){
    var map = makeBaseMap(config.map);

    console.log('loading geojson');
    L.Util.ajax('data.geojson').then(function(data){

        var info = makeInfoBox(config.properties, map);
        //var search = makeSearch(config.search, map);

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

        var geoLayer = L.geoJson(data, {onEachFeature: setupFeature}).addTo(map);

    });

    new L.Control.GeoSearch({
        provider: new L.GeoSearch.Provider.Google(),
        position: 'topleft',
        showMarker: false
    }).addTo(map);

    map.locate({setView: true, maxZoom: 14}); //geolocate on load
});



var makeInfoBox = function(config, map){
    var info = L.control();

    info.onAdd = function () {
        return this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    };

    info.update = function (featureProps) {
        this._div.innerHTML = createPopup(config, featureProps);
    };

    info.addTo(map);
    return info
}

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

    var mq = L.tileLayer('http://tiles.mapc.org/basemap/{z}/{x}/{y}.png', {        
        attribution: 'Tiles Courtesy of <a href="http://mapc.org">MAPC</a> &mdash; Map data &copy; <a href="http://www.mass.gov/mgis/">MassGIS</a>',
        subdomains: '1234'
    }).addTo(map);

    return map;
}

/*
var makeSearch = function(config, map){
    var search = L.control({position:'topleft'});
    var searchDiv = L.DomUtil.create('div', 'search');
    //searchElements = []

    for (var key in config){
        if (key == 'geosearch'){
            var geoDiv = L.DomUtil.create('div', 'geosearch', searchDiv);
            geoDiv.innerHTML = "<form id=\"geoSearchForm\" action=\"/search\" method=\"GET\"> <input id=\"searchInput\" type=\"text\" name=\"term\" placeholder=\"Address/City/Zip\"> <input id=\"searchSubmit\" type=\"submit\" value=\"Locate\"> </form>"
        }
        //other search options
    }

    search.onAdd = function (){
        return search._div = searchDiv;
    }
    search.addTo(map);

    $('#geoSearchForm').submit(function(event) {
        var searchText = $('#searchInput').val();
        alert(searchText);

        event.preventDefault();
    });

    return search;
}
*/

/*
var addGoogleGeoSearch = function(map) {

    var geocoder = new google.maps.Geocoder();

    function googleGeocoding(text, callResponse) {
        geocoder.geocode({address: text}, callResponse);
    }

    function filterJSONCall(rawjson) {
        var json = {},
        key, loc, disp = [];

        for(var i in rawjson)
        {
            key = rawjson[i].formatted_address;      
            loc = L.latLng( rawjson[i].geometry.location.mb, rawjson[i].geometry.location.nb );            
            json[ key ]= loc;   //key,value format
        }

        return json;
    }

    map.addControl( new L.Control.Search({
        callData: googleGeocoding,
        filterJSON: filterJSONCall,
        markerLocation: false,
        autoType: false,
        autoCollapse: false,
        minLength: 2,
        zoom: 14
    }) );
}

var addOSMGeoSearch = function(map) {
    map.addControl( new L.Control.Search({
            url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
            jsonpParam: 'json_callback',
            propertyName: 'display_name',
            propertyLoc: ['lat','lon'],
            //markerLocation: true,
            //autoType: false,
            autoCollapse: false,
            minLength: 2,
            zoom:14
        }) );    
}


'submit #search form': 'search',

    search: function(e) {
      e.preventDefault();
      var $form = $(e.target);
      var term = $form.find('[name=term]').val();
      this.collection.search({term: term});
    }



//use to zoom to a resonable item-filled view after geoloacting

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

map.on('locationfound', onLocationFound);
*/






