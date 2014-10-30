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
                                                   'setMaxBounds']);
        spyOn(L.control, 'locate').andReturn(
          jasmine.createSpyObj('Locate', ['addTo']));
        this.component.map.options = {};
        this.component.trigger('config', mock.config);
        expect(this.component.map.options.maxZoom, mock.config.map.maxZoom);
        expect(this.component.map.setView).toHaveBeenCalledWith(
          mock.config.map.center, mock.config.map.zoom);
        expect(this.component.map.setMaxBounds).toHaveBeenCalledWith(
          mock.config.map.maxBounds);
        expect(L.control.locate).toHaveBeenCalledWith();
        expect(L.control.locate().addTo).toHaveBeenCalledWith(
          this.component.map);
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

      it('leaves dragging off when not in edit mode', function() {
        var feature = mock.data.features[0];
        var marker = this.component.attr.features[feature.geometry.coordinates];
        expect(!marker.dragging._enabled).toBe(true);
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

    describe('in edit mode', function() {
      var layer;
      beforeEach(function() {

        // Initialize with deep copies of mock config & data, so we
        // don't have to worry about scribbling on the originals.
        //
        // Also, set 'edit_mode' to true in the mock config.

        this.component.trigger('config', $.extend(true, {}, mock.config,
                                                  {edit_mode: true}));
        this.mockData = $.extend(true, {}, mock.data);
        this.component.trigger('data', this.mockData);
      });

      it('sets create-feature popup label from config', function() {
        setFixtures('<label id="new-feature-popup-label">fubar</label>');
        this.component.trigger('config', $.extend(true, {}, mock.config,
                                                  {edit_mode: true}));
        expect($('label').html()).toBe(mock.config.new_feature_popup_label);
      });

      it('shows create-new-feature popup on double click', function() {
        this.component.map.fireEvent('dblclick', {latlng: L.latLng(90.0, 0.0)});
        var popup = this.component.createPopup;
        expect(popup).not.toBe(undefined);
        expect(popup.getLatLng().lat).toBe(90);
        expect(popup.getLatLng().lng).toBe(0);
        expect(popup._map).toBe(this.component.map);
        this.component.map.removeLayer(popup);
      });

      it('triggers events on create-feature form submit', function() {

        // Put a mock-form in the fixtures.
        setFixtures('<form class="create-feature-popup-form"><input name="foo" value="North Pole"/></form>');
        spyOnEvent(document,'newFeature');
        spyOnEvent(document,'selectFeature');

        // Get a popup in position, since that's where we grab the latlng from.
        this.component.map.fireEvent('dblclick', {latlng: L.latLng(90, 0)});
        var popup = this.component.createPopup;
        expect(popup).not.toBe(undefined);

        // Also fake up the event binding ordinarily done by startCreate.
        var form = $("form.create-feature-popup-form");
        form.on('submit', this.component.finishCreate.bind(this.component));

        // Fake submittal...
        this.component.trigger(form, 'submit');
        expect('newFeature').toHaveBeenTriggeredOn(document);
        expect('selectFeature').toHaveBeenTriggeredOn(document);

        var feature = this.component.lastCreatedFeature;
        expect(feature.geometry.coordinates).toEqual([0, 90]);

        var prop = this.component.featurePreviewAttr;
        expect(feature.properties[prop]).toBe('North Pole'); // from mock form

        // Should have taken down the popup on its own as well.
        expect(popup._map).toBe(null);
      });

      describe('with a feature', function() {

        beforeEach(function() {
          this.feature = this.mockData.features[0];
          this.marker = this.component.attr.features[this.feature.geometry.coordinates];
        });

        // For some reason, spies on this.marker.dragging.{enable,disable}
        // don't work, so...

        it('enables dragging on select', function() {
          this.component.trigger(document, 'selectFeature', this.feature);
          expect(this.marker.dragging._enabled).toBe(true);
        });
        
        it('disables dragging on deselect', function() {
          this.component.trigger(document, 'selectFeature', this.feature);
          this.component.trigger(document, 'deselectFeature', this.feature);
          expect(!this.marker.dragging._enabled).toBe(true);
        });

        it('resets position on external posn change', function() {
          this.component.trigger(document, 'selectFeature', this.feature);
          var newPos = [44, 33];

          spyOn(this.marker, 'setLatLng');
          this.component.trigger(document, 'selectedFeatureMoved', [newPos]);
          expect(this.marker.setLatLng).toHaveBeenCalled;

          var latlng = this.marker.setLatLng.mostRecentCall.args[0];
          expect(latlng.lat).toBe(33);
          expect(latlng.lng).toBe(44);
        });
        
        it("doesn't reset posn unless 'move' event actually moved", function() {
          this.component.trigger(document, 'selectFeature', this.feature);
          var oldLatLng = this.marker.getLatLng();
          var newPos = [oldLatLng.lng, oldLatLng.lat];

          spyOn(this.marker, 'setLatLng');
          this.component.trigger(document, 'selectedFeatureMoved', [newPos]);
          expect(this.marker.setLatLng).not.toHaveBeenCalled();
        });
        
        it('reports new position on drag-end', function() {
          spyOnEvent(document, 'selectedFeatureMoved');
          this.component.trigger(document, 'selectFeature', this.feature);
          this.marker.fireEvent('dragend');
          var pos = this.marker.getLatLng();
          expect('selectedFeatureMoved').toHaveBeenTriggeredOnAndWith(
            document, [pos.lng, pos.lat]);
        });

        it('fades marker on selectedFeatureDeleted', function() {
          spyOn(this.marker, 'setOpacity');
          this.component.trigger(document, 'selectFeature', this.feature);
          this.component.trigger(document, 'selectedFeatureDeleted');
          expect(this.marker.setOpacity).toHaveBeenCalledWith(0.4);
        });

        it('unfades marker on selectedFeatureUndeleted', function() {
          spyOn(this.marker, 'setOpacity');
          this.component.trigger(document, 'selectFeature', this.feature);
          this.component.trigger(document, 'selectedFeatureUndeleted');
          expect(this.marker.setOpacity).toHaveBeenCalledWith(1.0);
        });

      });

    });

  });
});
