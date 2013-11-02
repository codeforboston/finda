

var popupTemplate = Mustache.compile("<div>hello</div>");

//setup values for the popup
var createPopup = function(configs, features) {
    console.log("creating popup");
    var values = [];
    for(var key in config){
        if(features[key]){
            values.push({
                title: key,
                value: feature[key]
            })
        }
    }
    return popupTemplate({popup:value});
}

//var popupTemplate = Mustache.compile("<div>{{#popup}}<div id={{title}}>{{value}}</div id={{title}}>{{/popup}}</div>");

console.log('loading config');
L.Util.ajax('config.json').then(function(config){
    var map = L.map('map');
    if (!location.hash) {
        map.setView(config.center, config.zoom);
    }
    map.addHash();

    var mq = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
	    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
	    subdomains: '1234'
    }).addTo(map);

    console.log('loading geojson');
    L.Util.ajax('data.geojson').then(function(data){
        //var layers = L.control.layers().addTo(map);
    
        var features = function(feature, layer) {
            console.log("running feature function");
            console.log(feature);
            console.log(layer);
            if (config.properties && feature.properties) {
                //layer.bindPopup(createPopup(config.properties, feature.properties));
            }
        };
        console.log(data);

        //layers.addOverlay(
            L.geoJson(data,
            {onEachFeature: features
            //,
            // filter:function(feature){
            //    console.log("adding value -- " + feature.properties.address);
            //    return typeof feature.properties !== 'undefined';
            // }
            }).addTo(map); //, "data");
    });
});
