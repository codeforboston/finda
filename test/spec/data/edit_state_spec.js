define(['test/mock', 'jquery'], function(mock, $) {
  'use strict';
  describeComponent('data/edit_state', function() {
    beforeEach(function() {
      setupComponent();
    });

    describe('on data load', function() {
      it('records the data', function() {
	this.component.trigger('data', mock.data);
	expect(this.component.data).toEqual(mock.data);
      });
    });

    describe('editing protocol', function() {

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

	it("updates position upon UI request", function() {
	  $(document).trigger('selectedFeatureMoved', {lat: 55, lng: 44});
	  expect(this.feature.geometry.coordinates).toEqual([44, 55]);
	  expect(this.component.data.features[0].geometry.coordinates).toEqual([44,55]);
	});
      });

      it('sends edited data back to whoever asks', function() {
	spyOnEvent(document, 'callbackEvent');
	this.component.trigger('data', mock.data);
	$(document).trigger('requestEditedData', 'callbackEvent')
	expect('callbackEvent').toHaveBeenTriggeredOnAndWith(
	  document, mock.data);
      });
    });
  });
});