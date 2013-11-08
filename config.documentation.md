###Files:

####data.geojson

* Match the geojson spec

* A FeatureCollection with only Point geometries

####config.geojson

* map: elements that control the basic map, mostly correspond to leaflet map options.

  * center: center of the initial map location

  * zoom: zoom level

  * maxZoom: the maximum amount a user can zoom in

  * maxBounds: bounds of a rectangle the user cannot zoom out of

* properties: how the properties element in each geojson feature should be displayed

  * each key is the name of a property, their order is the order they will be displayed on the popup. if the field is empty (null, empty string, empty list) it will not be displayed.

  * fields in properties:

    * title: if a field has a title attribute it will be displayed after that title value, if not it will be displayed alone.

    * url: boolean, if a field is a url it will be displayyed as a hyperlink with either the title text or [link].

