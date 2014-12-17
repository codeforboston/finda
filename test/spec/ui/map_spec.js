define(
  ['leaflet', 'test/mock', 'jquery', 'lodash'], function(L, mock, $, _) {
  'use strict';
  describeComponent('ui/map', function() {
    beforeEach(function() {
      L.Icon.Default.imagePath = '/base/lib/leaflet/images';
      spyOn(L.control, 'locate').andReturn(
        jasmine.createSpyObj('Locate', ['addTo']));
      spyOn(L.control, 'scale').andReturn(
        jasmine.createSpyObj('Scale', ['addTo']));
      setupComponent();
    });

    describe('initialize', function() {
      it('sets up the map', function() {
        expect(this.component.map).toBeDefined();
      });
      it('sets up the scale control', function() {
        expect(L.control.scale).toHaveBeenCalledWith();
        expect(L.control.scale().addTo).toHaveBeenCalledWith(
          this.component.map);
      });
      it('sets up the locate control', function() {
        expect(L.control.locate).toHaveBeenCalledWith();
        expect(L.control.locate().addTo).toHaveBeenCalledWith(
          this.component.map);
      });
    });
    describe('loading data', function () {
      it('config sets up the map object', function() {
        this.component.map = jasmine.createSpyObj('Map',
                                                  ['setView',
                                                   'setMaxBounds',
                                                   'invalidateSize',
                                                   'addLayer',
                                                   'remove'
                                                  ]);
        this.component.map.options = {};
        this.component.trigger('config', mock.config);
        expect(this.component.map.options.maxZoom, mock.config.map.maxZoom);
        expect(this.component.map.setView).toHaveBeenCalledWith(
          mock.config.map.center, mock.config.map.zoom);
        expect(this.component.map.setMaxBounds).toHaveBeenCalledWith(
          mock.config.map.maxBounds);
      });

      it('data sets up the features', function() {
        this.component.trigger('data', mock.data);
        waits(25);
        runs(function() {
          expect(_.size(this.component.layers)).toEqual(3);
        });
      });

      it('data a second time resets the data', function() {
        this.component.trigger('data', {type: 'FeatureCollection',
                                        features: []});
        waits(25);
        runs(function() {
          expect(_.size(this.component.layers)).toEqual(0);
        });
      });
    });

    describe('panning', function() {
      beforeEach(function() {
        spyOn(this.component.map, 'panTo');
      });
      it('panTo goes to the lat/lng with maximum zoom', function() {
        var latlng = {lat: 1, lng: 2};
        this.component.trigger('config', mock.config);
        this.component.trigger('panTo', latlng);
        expect(this.component.map.panTo).toHaveBeenCalledWith(
          latlng);
      });
    });

    describe('on map move', function() {
      it('triggers a mapBounds event with the corners of the map', function() {
        var map = this.component.map;

        spyOnEvent(this.component.node, 'mapBounds');

        map.setView([0, 0], 11);

        expect('mapBounds').toHaveBeenTriggeredOn(this.component.node);
        expect('mapBounds').toHaveBeenTriggeredOnAndWith(
          this.component.node,
          {
            southWest: [map.getBounds().getSouthWest().lat,
                        map.getBounds().getSouthWest().lng],
            northEast: [map.getBounds().getNorthEast().lat,
                        map.getBounds().getNorthEast().lng]
          }
        );
      });
    });

    describe('clicking an icon', function() {
      var layer;
      beforeEach(function() {
        spyOnEvent(document, 'selectFeature');
        this.component.trigger('config', mock.config);
        this.component.trigger('data', mock.data);

        waits(25);
        runs(function() {
          // fake the click event
          layer = this.component.layers[mock.data.features[0].id];
          layer.fireEvent('click', {
            latlng: layer._latlng
          });
        });
      });

      it('sends a selectFeature event', function() {
        expect('selectFeature').toHaveBeenTriggeredOnAndWith(
          document, layer.feature);
      });
    });

    describe('selectFeature', function() {
      beforeEach(function() {
        this.component.trigger('config', mock.config);
        this.component.trigger('data', mock.data);
        waits(25);
        runs(function() {
          this.component.trigger(document,
                                 'selectFeature', mock.data.features[0]);
        });
      });
      it('turns the icon gray', function() {
        var icon = this.component.$node.find('.leaflet-marker-icon:first');
        expect(icon.attr('src')).toMatch(/marker-icon-gray\.png$/);
      });

      it('turns the previously clicked icon back to the default', function() {
        this.component.trigger(document, 'selectFeature', null);
        var icon = this.component.$node.find('.leaflet-marker-icon:first');
        expect(icon.attr('src')).toMatch(/marker-icon\.png$/);
      });
    });

    describe('deselectFeature', function() {
      beforeEach(function() {
        this.component.trigger('config', mock.config);
        this.component.trigger('data', mock.data);
        waits(25);
        runs(function() {
          this.component.trigger(document,
                                 'selectFeature', mock.data.features[0]);
        });
      });
      it('turns the icon back to default', function() {
        this.component.trigger(document, 'deselectFeature', mock.data.features[0]);
        var icon = this.component.$node.find('.leaflet-marker-icon:first');
        expect(icon.attr('src')).toMatch(/marker-icon\.png$/);
      });
    });

    describe("dataSearchResult", function() {
      beforeEach(function() {
        this.component.trigger('config', mock.config);
        this.component.trigger('data', mock.data);
        spyOnEvent('.component-root', 'panTo');
        this.component.trigger(
          document,
          'dataSearchResult',
          {
            lat: 41,
            lng: -71
          }
        );
      });
      it('puts a marker on the map', function() {
        expect(this.$node.find('.search-result-marker').length).toEqual(1);
      });
      it('puts the marker at the given lat/lng', function() {
        expect(this.component.searchMarker._latlng.lat).toEqual(41);
        expect(this.component.searchMarker._latlng.lng).toEqual(-71);
      });
      it('pans to the lat/long if present', function() {
        expect('panTo').toHaveBeenTriggeredOnAndWith(
          '.component-root',
          {lat: 41,
           lng: -71
          });
      });
    });
  });
});
