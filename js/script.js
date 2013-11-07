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

        var info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            //this.update();
            return this._div;
        };

        // method that we will use to update the control based on feature properties passed
        info.update = function (featureProps) {
            this._div.innerHTML = createPopup(config.properties, featureProps);
        };

        info.addTo(map);


        //Click functions
        var onClick = function(e){
            console.log("click");
            zoomToElement(e);
            fillInfobox(e);
        };
        var zoomToElement = function(e){
            console.log(e);
            map.panTo(e.latlng);
        };
        var fillInfobox = function(e){
            var layer = e.target;
            info.update(layer.feature.properties)
        };
    
        var setupLayer = function(feature, layer) {
            console.log("running feature function");
            console.log(feature.properties.address);
            layer.on({
                click: onClick
            });

            //console.log(layer);
            //if (config.properties && feature.properties) {
            //    layer.bindPopup(createPopup(config.properties, feature.properties));
            //}
        };
        console.log(data);

        L.geoJson(data, {onEachFeature: setupLayer}).addTo(map);
    });

    //use locate() to geolocate
});




