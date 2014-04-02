define(
  ['leaflet', 'test/mock', 'jquery', 'lodash'], function(L, mock, $, _) {
  'use strict';
  describeComponent('ui/map', function() {
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
        expect(_.size(this.component.attr.features)).toEqual(3);
      });

      it('data a second time resets the data', function() {
        this.component.trigger('data', {type: 'FeatureCollection',
                                        features: []});
        expect(_.size(this.component.attr.features)).toEqual(0);
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
      var layer;
      beforeEach(function() {
        spyOnEvent(document, 'selectFeature');
        this.component.trigger('config', mock.config);
        this.component.trigger('data', mock.data);

        // fake the click event
        layer = this.component.attr.features[
          mock.data.features[0].geometry.coordinates];
        layer.fireEvent('click', {
          latlng: layer._latlng
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
        this.component.trigger(document,
                               'selectFeature', mock.data.features[0]);
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
        this.component.trigger(document,
                               'selectFeature', mock.data.features[0]);
      });
      it('turns the icon back to default', function() {
        this.component.trigger(document, 'deselectFeature', mock.data.features[0]);
        var icon = this.component.$node.find('.leaflet-marker-icon:first');
        expect(icon.attr('src')).toMatch(/marker-icon\.png$/);
      });

    });

  });
});
