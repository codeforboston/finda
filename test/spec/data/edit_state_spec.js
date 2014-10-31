define(['test/mock', 'jquery', 'lodash'], function(mock, $, _) {
  'use strict';
  describeComponent('data/edit_state', function() {
    beforeEach(function() {
      setupComponent();
    });

    afterEach(function() {
      if (this.component.reindexTimeout) {
        clearTimeout(this.component.reindexTimeout);
      }
    });

    describe('on data load', function() {
      it('records the data', function() {
        this.component.trigger('data', mock.data);
        expect(this.component.data).toEqual(mock.data);
      });
    });

    describe('on config', function() {
      it ('honors explicit edit_reindex_timeout_secs', function() {
        var config = _.cloneDeep(mock.config);
        config.edit_reindex_timeout_secs = 2;
        this.component.trigger('config', config);
        expect(this.component.reindexTimeoutSecs).toBe(2);
      });
      it ('defaults unspecified edit_reindex_timeout_secs', function() {
        var config = _.cloneDeep(mock.config);
        config.edit_reindex_timeout_secs = undefined;
        this.component.trigger('config', config);
        expect(this.component.reindexTimeoutSecs).toBe(10);
      });
    });

    describe('editing protocol', function() {

      it('adds new features on request', function() {
        var newFeature = { 
          type: "Feature",
          geometry: { type: "Point", coordinates: [0, 90] },
          properties: { name: "North Pole" }
        };
        this.component.trigger('data', _.cloneDeep(mock.data));
        this.component.trigger('newFeature', newFeature);

        var features = this.component.data.features;
        expect(features.length).toBe(mock.data.features.length + 1);

        var lastFeature = features[features.length - 1];
        expect(lastFeature).toBe(newFeature);
      });

      describe('with a selected feature', function() {

        beforeEach(function() {

          // We load in a deep copy of the mock data, for test isolation;
          // if we loaded in 'mock.data' directly, each test would see
          // dinks from all other tests that had previously run.

          this.copiedData = $.extend(true, {}, mock.data);
          this.component.trigger('data', this.copiedData);

          this.feature = this.copiedData.features[0];
          $(document).trigger('selectFeature', this.feature);
        });

        it("records the selected feature for further work", function() {
          expect(this.component.selectedFeature).toBe(this.feature);
        });

        it("sets deleted flag on selectedFeatureDeleted", function() {
          $(document).trigger('selectedFeatureDeleted');
          expect(this.component.selectedFeature.deleted).toBe(true);
        });

        it("clears deleted flag on selectedFeatureUndeleted", function() {
          this.component.selectedFeature.deleted = true;
          $(document).trigger('selectedFeatureUndeleted');
          expect(this.component.selectedFeature.deleted).toBe(false);
        });

        it("updates position upon UI request", function() {
          $(document).trigger('selectedFeatureMoved', [[44, 55]]);
          expect(this.feature.geometry.coordinates).toEqual([44, 55]);
          expect(this.component.data.features[0].geometry.coordinates).toEqual([44,55]);
        });

        it("changes properties on request", function() {
          $(document).trigger('selectedFeaturePropsChanged',
                              {organization_name: "fred"});
          expect(this.feature.properties.organization_name).toBe("fred");
        });

        it("leaves props alone unless changed value specified", function() {
          var oldUrl = this.feature.properties.web_url;
          $(document).trigger('selectedFeaturePropsChanged',
                              {organization_name: "fred"});
          expect(this.feature.properties.web_url).toBe(oldUrl);
        });

        it("schedules reindex upon position change", function() {
          spyOn(this.component, 'scheduleReindex');
          $(document).trigger('selectedFeatureMoved', [[44, 55]]);
          expect(this.component.scheduleReindex).toHaveBeenCalled();
        });

        it("schedules reindex upon property change", function() {
          spyOn(this.component, 'scheduleReindex');
          $(document).trigger('selectedFeaturePropsChanged',
                              {organization_name: "fred"});
          expect(this.component.scheduleReindex).toHaveBeenCalled();
        });
      });

      it('sends edited data back to whoever asks', function() {
        spyOnEvent(document, 'callbackEvent');
        this.component.trigger('data', mock.data);
        $(document).trigger('requestEditedData', 'callbackEvent')
        expect('callbackEvent').toHaveBeenTriggeredOn(document);
        expect(this.component.lastExport).toEqual(mock.data);
      });

      it("respects deleted flag on exports", function() {
        this.copiedData = $.extend(true, {}, mock.data);
        this.component.trigger('data', this.copiedData);
        this.copiedData.features[0].deleted = true;
        this.copiedData.features[1].deleted = false;

        spyOnEvent(document, 'callbackEvent');
        $(document).trigger('requestEditedData', 'callbackEvent')

        var exported = this.component.lastExport.features;
        var original = mock.data.features;
        expect(exported.length).toBe(original.length - 1);
        expect(exported[0]).toEqual(original[1]);
      });

    });
  });
});