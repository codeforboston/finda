'use strict';
define(['jquery'], function($) {
  describeComponent('ui/search', function() {
    beforeEach(function() {
      setupComponent('<div><form><input class=address></form></div>',
                     {searchSelector: 'input',
                      mapSelector: 'div'});
      spyOnEvent('div', 'panTo');
      spyOn(this.component, 'addGoogleScript');

      window.google = {maps: jasmine.createSpyObj(
        'maps', ['Geocoder', 'LatLng', 'LatLngBounds'])};
      window.google.maps.Geocoder.andReturn({});
      this.config = {search: {geosearch: true},
                     map: {maxBounds: 'maxBounds'}};
    });

    afterEach(function() {
      window.google = undefined;
    });

    describe('configuration sets up local values and adds a script', function() {
      beforeEach(function() {
        $(document).trigger('config', this.config);
      });
      it('sets up local values', function() {
        expect(this.component.maxBounds).toEqual(this.config.map.maxBounds);
      });
      it('adds a google maps script', function() {
        expect(this.component.addGoogleScript).toHaveBeenCalledWith();
        expect(window.googleMapsApiLoaded).toEqual(jasmine.any(Function));
      });
      it('hides the widget if it is not requested', function() {
        this.config.search.geosearch = false;
        $(document).trigger('config', this.config);
        expect(this.$node).not.toBeVisible();
      });
    });

    describe('googleMapsApiLoaded', function() {
      beforeEach(function() {
        this.component.script = jasmine.createSpyObj('DOM', ['remove']);
        this.component.googleMapsApiLoaded();
      });
      it('removes the script', function() {
        expect(this.component.script.remove).toHaveBeenCalledWith();
      });
      it('creates the geocoder object', function() {
        expect(this.component.geocoder).toBeDefined();
        expect(window.google.maps.Geocoder).toHaveBeenCalledWith();
      });
    });

    describe('form submission', function() {
      beforeEach(function() {
        this.component.maxBounds = [1, 2];
        this.component.geocoder = jasmine.createSpyObj(
          'Geocoder', ['geocode']);
      });
      it('does nothing if the input is empty', function() {
        this.$node.find('input').submit();
        expect('panTo').not.toHaveBeenTriggered();
        expect(this.component.geocoder.geocode).not.toHaveBeenCalled();
      });
      it('calls the geocoder with the address', function() {
        this.$node.find('input').val('address').submit();
        expect(this.component.geocoder.geocode).toHaveBeenCalled();
        var args = this.component.geocoder.geocode.mostRecentCall.args;
        expect(args[0].address).toEqual('address');
        expect(args[0].bounds).toBeDefined();
        expect(args[1]).toEqual(jasmine.any(Function));
      });
    });

    describe('searchResults', function() {
      it('does nothing if there are no results', function() {
        this.component.searchResults([]);
        expect('panTo').not.toHaveBeenTriggered();
      });
      it('pans to the first lat/long if present', function() {
        var location = jasmine.createSpyObj('Location', ['lat', 'lng']);
        location.lat.andReturn('lat');
        location.lng.andReturn('lng');
        this.component.searchResults([
          {geometry: {location: location}}
        ]);
        expect('panTo').toHaveBeenTriggeredOnAndWith(
          this.component.attr.mapSelector,
          {lat: 'lat', lng: 'lng'});
      });
    });
  });
});
