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
        expect(this.component.reindexTimeoutSecs).toBe(5);
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

      describe("undo protocol", function() {

        beforeEach(function() {
          this.copiedData = $.extend(true, {}, mock.data);
          this.component.trigger('data', this.copiedData);
          spyOnEvent(document, 'selectedFeatureUndoStatus');
          this.sampleFeature = this.copiedData.features[0];
        });

        it("reports no undo when selecting unchanged feature", function() {
          this.component.trigger('selectFeature', this.sampleFeature);
          expect('selectedFeatureUndoStatus').toHaveBeenTriggeredOnAndWith(
            document, false);
        });

        it("reports undo status when selecting changed feature", function() {
          this.component.prepForUndo(this.sampleFeature);
          this.sampleFeature.properties.organization_name = 'Fred';
          this.component.trigger('selectFeature', this.sampleFeature);
          expect('selectedFeatureUndoStatus').toHaveBeenTriggeredOnAndWith(
            document, true);
        });

        it("reports undo status when selecting deleted feature", function() {
          this.component.prepForUndo(this.sampleFeature);
          this.sampleFeature.deleted = true;
          this.component.trigger('selectFeature', this.sampleFeature);
          expect('selectedFeatureUndoStatus').toHaveBeenTriggeredOnAndWith(
            document, true);
        });

        it("reports no undo when selecting reverted feature", function() {
          // The following sets up feature with undo state, but *no* changes.
          this.component.prepForUndo(this.sampleFeature);
          this.component.trigger('selectFeature', this.sampleFeature);
          expect('selectedFeatureUndoStatus').toHaveBeenTriggeredOnAndWith(
            document, false);
        });

        it("reports change in undo status when deleting", function() {
          // Want to trigger "undo status" event only once, so can't
          // do selectFeature...
          this.component.selectedFeature = this.sampleFeature;
          this.component.trigger('selectedFeatureDeleted');
          expect('selectedFeatureUndoStatus').toHaveBeenTriggeredOnAndWith(
            document, true);
        });

        it("reports change in undo status when moving", function() {
          this.component.selectedFeature = this.sampleFeature;
          this.component.trigger('selectedFeatureMoved', [[90, 0]]);
          expect('selectedFeatureUndoStatus').toHaveBeenTriggeredOnAndWith(
            document, true);
        });

        it("reports change in undo status when changing features", function() {
          this.component.selectedFeature = this.sampleFeature;
          this.component.trigger('selectedFeaturePropsChanged',
                                 {organization_name: 'Shady Town Hall'});
          expect('selectedFeatureUndoStatus').toHaveBeenTriggeredOnAndWith(
            document, true);
        });

        it("restores data when undo requested", function() {
          spyOnEvent(document, 'selectedFeatureUndeleted');
          spyOnEvent(document, 'selectedFeatureMoved');
          spyOnEvent(document, 'selectedFeaturePropsChanged');

          var origPosn = _.clone(this.sampleFeature.geometry.coordinates);

          this.component.selectedFeature = this.sampleFeature;
          this.component.trigger('selectedFeatureMoved', [[90, 0]]);

          this.component.trigger('requestUndo');
          expect('selectedFeatureUndeleted').toHaveBeenTriggeredOn(document);
          expect('selectedFeatureMoved').toHaveBeenTriggeredOnAndWith(
            document, origPosn);
          expect('selectedFeaturePropsChanged').toHaveBeenTriggeredOnAndWith(
            document, this.sampleFeature.properties);
        });
      });

      describe("export protocol", function() {

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
});