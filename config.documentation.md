### Files:

#### data.geojson

* Match the geojson spec

* A FeatureCollection with only Point geometries

#### config.geojson

* map: 

    * center: The center of the map when it first appears.

    * zoom: The zoom level of the map when it first appears. In the northeast U.S., a zoom level of 8 is a region, 12 is a city, 15 is street detail.

    * maxZoom: How close the user can zoom in.

    * maxBounds: The limits of where the user can scroll on the map. The two coordinates are the northwest and southeast corners of the bounding box.

* properties: How the properties in each GeoJSON feature are displayed.

  * each key is the name of a property, their order is the order they will be displayed on the popup. if the field is empty (null, empty string, empty list) it will not be displayed.

  * fields in properties:

    * title: if a field has a title attribute it will be displayed after that title value, if not it will be displayed alone.

    * url: boolean, if a field is a url it will be displayyed as a hyperlink with either the title text or [link].

