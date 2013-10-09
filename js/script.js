L.Util.ajax('config.json').then(function(config){
    var map = L.map('map');
    if (!location.hash) {
        map.setView(config.center, config.zoom);
    }
    map.addHash();
    var popupTemplate = Mustache.compile("<ul>{{#popup}}<li>{{title}}: {{value}}</li>{{/popup}}</ul>");
    var mq = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
	    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
	    subdomains: '1234'
    }).addTo(map);
    L.Util.ajax('data.geojson').then(function(data){
    var layers = L.control.layers().addTo(map);
    var features = function(feature, layer) {
                var values = [];
                if (feature.properties) {
                    for(var key in feature.properties){
                        if(config.attributes[key]){
                            values.push({
                                title:(config.attributes[key].title||key),
                                value: feature.properties[key]
                            })
                        }
                    }
                    if(values.length){
                        layer.bindPopup(popupTemplate({popup:values}));
                    }
                }
            };
       Object.keys(config.attributes).forEach(function(key){
        if(Array.isArray(config.attributes[key].values)){
            config.attributes[key].values.forEach(function(value){
                layers.addOverlay(L.geoJson(data,{onEachFeature:features,filter:function(feature){
                    return typeof feature.properties !== 'undefined' && feature.properties[key]===value;
                }}).addTo(map),(config.attributes[key].title||key)+':'+value);
            })
        }else{
            layers.addOverlay(L.geoJson(data,{onEachFeature:features,filter:function(feature){
                return typeof feature.properties !== 'undefined' && feature.properties[key];
            }}).addTo(map),config.attributes[key].title||key);
           }
        });
    });
});
