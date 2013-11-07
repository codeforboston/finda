'use strict';

console.log('loading config');
L.Util.ajax('config.json').then(function(config){
    var map = L.map('map');

    if (config.map){
        if (!location.hash) {
            map.setView(config.map.center, config.map.zoom);
        }
        if (config.map.maxZoom){
            map.options.maxZoom = config.map.maxZoom;
        }
        if (config.map.maxBounds){
            //var bounds = L.LatLngBounds(config.map.maxBounds[0], config.map.maxBounds[1]);
            map.setMaxBounds(config.map.maxBounds);
        }
    }
    map.addHash();

    var mq = L.tileLayer('http://tiles.mapc.org/basemap/{z}/{x}/{y}.png', {        
	    attribution: 'Tiles Courtesy of <a href="http://mapc.org">MAPC</a> &mdash; Map data &copy; <a href="http://www.mass.gov/mgis/">MassGIS</a>',
	    subdomains: '1234'
    }).addTo(map);

    console.log('loading geojson');
    L.Util.ajax('data.geojson').then(function(data){
        //var layers = L.control.layers().addTo(map);
    
        var bindPopup = function(feature, layer) {
            console.log("running feature function");
            console.log(feature.properties.address);
            //layer.on({
            //    mouseover: highlightFeature,
            //    mouseout: resetHighlight,
            //    click: zoomToFeature
            //});

            //console.log(layer);
            if (config.properties && feature.properties) {
                layer.bindPopup(createPopup(config.properties, feature.properties));
            }
        };
        console.log(data);

        L.geoJson(data, {onEachFeature: bindPopup}).addTo(map);
    });
});
