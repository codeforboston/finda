define(['jquery'], function($) {
  'use strict';
  describeComponent('ui/search', function() {
    beforeEach(function() {
      setupComponent('<div><form><input class=address></form></div>',
                     {searchSelector: 'input',
                      mapSelector: 'div'});
      spyOnEvent('div', 'panTo');
      spyOnEvent(document, 'uiSearch');
      spyOn($, 'getJSON');
      this.config = {search: {geosearch: true},
                     map: {maxBounds: 'maxBounds'}};
    });

    describe('configuration sets up local values and adds a script', function() {
      beforeEach(function() {
        $(document).trigger('config', this.config);
      });
      it('sets up local values', function() {
        expect(this.component.maxBounds).toEqual(this.config.map.maxBounds);
      });
      it('hides the widget if it is not requested', function() {
        this.config.search.geosearch = false;
        $(document).trigger('config', this.config);
        expect(this.$node).not.toBeVisible();
      });
    });

    describe('form submission', function() {
      beforeEach(function() {
        this.component.maxBounds = [[1, 2], [3, 4]];
      });
      it('does nothing if the input is empty', function() {
        this.$node.find('input').submit();
        expect('panTo').not.toHaveBeenTriggered();
        expect($.getJSON).not.toHaveBeenCalled();
      });
      it('calls the geocoder with the address', function() {
        this.$node.find('input').val('address').submit();
        expect($.getJSON).toHaveBeenCalled();
        var args = $.getJSON.mostRecentCall.args;
        expect(args[0]).toEqual(this.component.attr.searchUrl);
        expect(args[1]).toEqual({
          format: "json",
          addressdetails: 1,
          q: "address",
          viewbox: "1,2,3,4"
        });
        expect(args[2]).toEqual(jasmine.any(Function));
      });
      it('emits a uiSearch event with the search query', function() {
        this.$node.find('input').val('address').submit();
        expect('uiSearch').toHaveBeenTriggeredOnAndWith(document,
                                                        {query: 'address'});
      });
    });

    describe('searchResults', function() {
      var mockResult = {
        "place_id":"98244943",
        "licence":"Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http:\/\/www.openstreetmap.org\/copyright",
        "osm_type":"relation",
        "osm_id":"2315704",
        "boundingbox": "box",
        "lat":"42.3604823",
        "lon":"-71.0595678",
        "display_name":"display name",
        "class":"place",
        "type":"city",
        "importance":1.0299782170989,
        "icon":"http:\/\/nominatim.openstreetmap.org\/images\/mapicons\/poi_place_city.p.20.png",
        "address":{
          "city":"Boston",
          "county":"Suffolk County",
          "state":"Massachusetts",
          "country":"United States of America",
          "country_code":"us"}};
      it('does nothing if there are no results', function() {
        this.component.searchResults([]);
        expect('panTo').not.toHaveBeenTriggered();
      });
      it('pans to the first lat/long if present', function() {
        this.component.searchResults([mockResult]);
        expect('panTo').toHaveBeenTriggeredOnAndWith(
          this.component.attr.mapSelector,
          {lat: mockResult.lat, lng: mockResult.lon});
      });
      it('sets the placeholder display to the city', function() {
        this.component.searchResults([mockResult]);
        var input = this.component.select('searchSelector');
        expect(input.attr('placeholder')).toEqual('Boston, Massachusetts');
        expect(input.val()).toEqual('');
      });
    });
  });
});
