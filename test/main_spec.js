'use strict';
define(['main', 'leaflet', 'jquery', 'test/mock'], function(main, L, $, mock) {
  describe('Main', function() {
    var div, map;
    beforeEach(function() {
      L.Icon.Default.imagePath = '/base/leaflet/images';
      div = $("<div />").attr("id", "map").appendTo("body");
      map = main(mock.config, mock.data);
    });

    afterEach(function() {
      div.remove();
    });

    it("is a function", function() {
      expect(main).toEqual(jasmine.any(Function));
    });

    describe("renders", function() {
      it("an icon for each feature", function() {
        expect(div.find(".leaflet-marker-icon").length).toEqual(3);
      });

      it("an info box", function() {
        expect(div.find(".info").length).toEqual(1);
      });
    });

    describe("events", function() {
      describe("clicking an icon", function() {
        var icon;
        beforeEach(function() {
          icon = div.find('.leaflet-marker-icon:first');
          // fake the click event
          map.layers[0].fireEvent('click', {
            latlng: map.layers[0]._latlng
          });
        });

        it("turns the icon gray", function() {
          expect(icon.attr('src')).toMatch(/marker-icon-gray\.png$/);
        });

        it("puts that info in the info box", function() {
          expect(div.find(".info").text()).toContain(
            mock.data.features[0].properties.organization_name);
        });
      });
    });
  });
});
