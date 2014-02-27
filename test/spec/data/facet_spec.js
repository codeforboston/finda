'use strict';
define(['test/mock'], function(mock) {
  describeComponent('data/facet', function() {
    beforeEach(function() {
      setupComponent();
      spyOnEvent(document, 'dataFacets');
      spyOnEvent(document, 'dataFiltered');
      spyOnEvent(document, 'data');
    });

    describe('on config', function() {
      beforeEach(function() {
        this.component.trigger('config', mock.config);
        });
      it('records the facets to display', function() {
        expect(this.component.attr.config).toEqual(mock.config.facets);
      });
    });

    describe('on data', function() {
      beforeEach(function() {
        this.component.trigger('config', mock.config);
        this.component.trigger('data', mock.data);
      });
      it('emits a "dataFacets" event with the values for each facet', function() {
        expect('dataFacets').toHaveBeenTriggeredOnAndWith(
          document,
          {services_offered: [
            {facet: 'public education', count: 1},
            {facet: 'social group', count: 2},
            {facet: 'support group', count: 3}]
          });
      });
    });

    describe('on uiFilterFacet', function() {
      beforeEach(function() {
        this.component.trigger('config', mock.config);
        this.component.trigger('data', mock.data);
      });
      it('emits a "dataFiltered" event with the filtered data (single value)', function() {
        this.component.trigger('uiFilterFacet', {
          facet: 'community',
          selected: ['Northampton']
        });

        expect('dataFiltered').toHaveBeenTriggeredOnAndWith(
          document,
          {type: 'FeatureCollection',
           features: [mock.data.features[0]]
          });
      });
      it('emits a "dataFiltered" event with the filtered data (list value)', function() {
        this.component.trigger('uiFilterFacet', {
          facet: 'services_offered',
          selected: ['social group']
        });

        expect('dataFiltered').toHaveBeenTriggeredOnAndWith(
          document,
          {type: 'FeatureCollection',
           features: [mock.data.features[0],
                      mock.data.features[1]]
          });
      });
      it('emits a "data" event with all data given an empty filter', function() {
        this.component.trigger('uiFilterFacet', {
          facet: 'community',
          selected: []
        });

        expect('data').toHaveBeenTriggeredOnAndWith(
          document,
          mock.data);
      });
    });
  });
});
