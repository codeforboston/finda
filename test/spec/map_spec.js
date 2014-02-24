'use strict';
define(['leaflet', 'test/mock'], function(L, mock) {
  describeComponent('map', function() {
    beforeEach(function() {
      L.Icon.Default.imagePath = '/base/lib/leaflet/images';
      setupComponent();
    });

    describe('initialize', function() {
      it('sets up the map', function() {
        expect(this.component.map).toBeDefined();
      });
    });
    describe('loading data', function () {
      it('config sets up the map object', function() {
        this.component.map = jasmine.createSpyObj('Map',
                                                  ['setView',
                                                   'setMaxBounds',
                                                   'locate']);
        this.component.map.options = {};
        this.component.trigger('config', mock.config);
        expect(this.component.map.options.maxZoom, mock.config.map.maxZoom);
        expect(this.component.map.setView).toHaveBeenCalledWith(
          mock.config.map.center, mock.config.map.zoom);
        expect(this.component.map.setMaxBounds).toHaveBeenCalledWith(
          mock.config.map.maxBounds);
        expect(this.component.map.locate).toHaveBeenCalledWith({
          setView: true,
          maxZoom: mock.config.map.zoom
        });
      });

      it('data sets up the features', function() {
        this.component.trigger('data', mock.data);
        expect(this.component.layers.length).toEqual(3);
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

    describe('clicking an icon', function() {
      beforeEach(function() {
        spyOnEvent(document, 'selectFeature');
        this.component.trigger('config', mock.config);
        this.component.trigger('data', mock.data);

        // fake the click event
        this.component.layers[0].fireEvent('click', {
          latlng: this.component.layers[0]._latlng
        });
      });

      it('turns the icon gray', function() {
        var icon = this.component.$node.find('.leaflet-marker-icon:first');

        expect(icon.attr('src')).toMatch(/marker-icon-gray\.png$/);
      });

      it('turns the previously clicked icon back to the default', function() {
        this.component.layers[1].fireEvent('click', {
          latlng: this.component.layers[1]._latlng
        });
        var icon = this.component.$node.find('.leaflet-marker-icon:first');
        expect(icon.attr('src')).toMatch(/marker-icon\.png$/);
      });

      it('sends a selectFeature event', function() {
        expect('selectFeature').toHaveBeenTriggeredOnAndWith(
          document,
          this.component.layers[0].feature);
      });
    });
  });
});
