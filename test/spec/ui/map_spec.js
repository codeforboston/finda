define(
  ['leaflet', 'test/mock', 'jquery', 'lodash'], function(L, mock, $, _) {
  'use strict';
  describeComponent('ui/map', function() {
    beforeEach(function() {
      L.Icon.Default.imagePath = '/base/lib/leaflet/images';
      setupComponent();
    });

    afterEach(function() {

      // The following bit of voodoo eliminates a Heisenbug causing spurious
      // test run failures (from exceptions thrown in a timeout outside of any
      // test).  What seems to be happening:
      //
      // Leaflet sometimes tries to fire 'moveend' events in a timeout, to
      // avoid a flurry of them.  That, in turn, tries to reset the pan bounds
      // to the map's max bounds, if those are defined -- and that process
      // can blow up in some circumstances if the timeout fires after the map
      // has already been removed from the DOM.
      //
      // Explicitly nullifying the bounds has the side-effect of removing the
      // event handler which blows up; with this patch, have >100 successful
      // test runs with no blowups in timeouts outside tests.

      if (this.component.map) {
        if (this.component.map.setMaxBounds) {
          this.component.map.setMaxBounds();
        }
      }
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
      beforeEach(function() {
        spyOnEvent(document, 'selectFeature');
        this.component.trigger('config', mock.config);
        this.component.trigger('data', mock.data);

        // fake the click event
        var layer = this.component.attr.features[
          mock.data.features[0].geometry.coordinates];
        layer.fireEvent('click', {
          latlng: layer._latlng
        });
        this.clickLayer = layer;
      });

      it('sends a selectFeature event', function() {
        expect('selectFeature').toHaveBeenTriggeredOnAndWith(
          document, this.clickLayer.feature);
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

      it('sets create-feature popup label from config', function() {
        var config=_.cloneDeep(mock.config);
        config.edit_mode = true;
        config.map.new_point_address_attribute = "xxaddress";
        this.component.trigger('config', config);
        expect(this.component.newPointAddrAttr).toBe("xxaddress");
      });

      it('shows create-new-feature popup on double click', function() {
        this.component.map.fireEvent('dblclick', {latlng: L.latLng(90.0, 0.0)});
        var popup = this.component.createPopup;
        expect(popup).not.toBe(undefined);
        expect(popup.getLatLng().lat).toBe(90);
        expect(popup.getLatLng().lng).toBe(0);
        expect(popup._map).toBe(this.component.map);
        expect(this.component.createAddress).toBe(undefined);
        this.component.map.removeLayer(popup);
      });

      it('shows create-new-feature popup on external request', function() {
        this.component.trigger('startCreateFeature', 
                               {position: L.latLng(90.0, 0.0),
                                address: "some address"
                               });
        var popup = this.component.createPopup;
        expect(popup).not.toBe(undefined);
        expect(popup.getLatLng().lat).toBe(90);
        expect(popup.getLatLng().lng).toBe(0);
        expect(popup._map).toBe(this.component.map);
        expect(this.component.createAddress).toBe("some address");
        this.component.map.removeLayer(popup);
      });

      describe("on submission of create-feature form", function() {
        beforeEach(function() {
          // Put a mock-form in the fixtures.
          setFixtures('<form class="create-feature-popup-form"><input name="foo" value="North Pole"/></form>');
          spyOnEvent(document,'newFeature');
          spyOnEvent(document,'selectFeature');

          // Get a popup in position, since that's where we grab the latlng from.
          this.component.map.fireEvent('dblclick', {latlng: L.latLng(90, 0)});
          this.popup = this.component.createPopup;
          expect(this.popup).not.toBe(undefined);

          // Also fake up the event binding ordinarily done by startCreate.
          this.form = $("form.create-feature-popup-form");
          this.form.on('submit', 
                       this.component.finishCreate.bind(this.component));
        });

        it('triggers events', function() {

          var popup = this.popup;

          // Fake submittal...
          this.component.trigger(this.form, 'submit');
          expect('newFeature').toHaveBeenTriggeredOn(document);
          expect('selectFeature').toHaveBeenTriggeredOn(document);

          var feature = this.component.lastCreatedFeature;
          expect(feature.geometry.coordinates).toEqual([0, 90]);

          var prop = this.component.featurePreviewAttr;
          expect(feature.properties[prop]).toBe('North Pole'); // from mock form

          // Should have taken down the popup on its own as well.
          expect(popup._map).toBe(null);
        });

        it('copies address where appropriate', function() {
          this.component.newPointAddrAttr="xxaddress";
          this.component.createAddress="90 North"
          this.component.trigger(this.form, 'submit');
          var feature = this.component.lastCreatedFeature;
          expect(feature.properties.xxaddress).toBe("90 North");
        });
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
          spyOn(this.component.map, 'panTo');
          this.component.trigger(document, 'selectedFeatureMoved', [newPos]);
          expect(this.marker.setLatLng).toHaveBeenCalled;

          var latlng = this.marker.setLatLng.mostRecentCall.args[0];
          expect(latlng.lat).toBe(33);
          expect(latlng.lng).toBe(44);
          expect(this.component.map.panTo).toHaveBeenCalledWith(latlng);
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
          var latlng = this.marker.getLatLng();
          var pos = [latlng.lng, latlng.lat];
          expect(this.component.attr.features[pos]).toBe(this.marker);
          expect('selectedFeatureMoved').toHaveBeenTriggeredOnAndWith(
            document, pos);
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
