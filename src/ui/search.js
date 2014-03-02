/*global google*/
define(
  ['flight',
   'jquery'],
  function(flight, $) {
    'use strict';
    var search = function() {
      this.defaultAttrs({
        searchSelector: 'input'
      });
      this.configureSearch = function(ev, config) {
        if (config.search && config.search.geosearch) {
          window.googleMapsApiLoaded = this.googleMapsApiLoaded.bind(this);
          this.maxBounds = config.map.maxBounds;
          this.addGoogleScript();
        } else {
          this.$node.hide();
        }
      };

      this.addGoogleScript = function() {
        // separate function so we can mock it for testing
        this.script = $('<script />')
          .attr('type', 'text/javascript')
            .attr('src', '//maps.google.com/maps/api/js?sensor=false&callback=googleMapsApiLoaded');
        this.script.appendTo('head');
      };

      this.googleMapsApiLoaded = function() {
        this.script.remove();
        this.geocoder = new google.maps.Geocoder();
        this.$node.show();
      };

      this.search = function(ev) {
        ev.preventDefault();
        var address = this.select('searchSelector').val(),
            parameters = {address: address};
        if (!address) {
          return;
        }
        if (this.maxBounds) {
          parameters.bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(this.maxBounds[0][0], this.maxBounds[0][1]),
            new google.maps.LatLng(this.maxBounds[1][0], this.maxBounds[1][1]));
        }
        this.geocoder.geocode(parameters, this.searchResults.bind(this));
      };

      this.searchResults = function(results) {
        if (results.length) {
          var location = results[0].geometry.location;
          this.trigger(this.attr.mapSelector,
                       'panTo',
                       {lat: location.lat(),
                        lng: location.lng()});
        }
      };

      this.after('initialize', function() {
        this.on('submit', this.search);
        this.on(document, 'config', this.configureSearch);
      });
    };

    return flight.component(search);
  });
