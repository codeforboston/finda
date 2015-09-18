define(['test/mock', 'lodash'], function(mock, _) {
  'use strict';
  describeComponent('data/facet', function() {
    beforeEach(function() {
      setupComponent();
      spyOnEvent(document, 'dataFacets');
      spyOnEvent(document, 'dataFiltered');
    });

    describe('on config', function() {
      beforeEach(function() {
        this.component.trigger('config', mock.config);
      });
      it('records the facets to display', function() {
        expect(this.component.config).toEqual(mock.config.facets);
      });
    });

    describe('on data', function() {
      beforeEach(function() {
        this.component.trigger('config', mock.config);
        this.component.trigger('data', mock.data);
        waits(100);
      });
      it('emits a "dataFacets" event with the values for each facet', function() {
        expect('dataFacets').toHaveBeenTriggeredOnAndWith(
          document,
          {
            services_offered: [
              {value: 'public education', count: 1, selected: false},
              {value: 'social group', count: 2, selected: false},
              {value: 'support group', count: 3, selected: false}
            ]
          });
      });
    });

    describe('on uiFilterFacet', function() {
      describe("single value facet", function() {
        beforeEach(function() {
          var config = _.clone(mock.config);
          config.facets = {
            community: {
              title: "Community",
              type: 'single'
            }
          };
          this.component.trigger('config', config);
          this.component.trigger('data', mock.data);
          this.component.trigger('uiFilterFacet', {
            facet: 'community',
            selected: ['Northampton']
          });
          waits(100);
        });
        it('emits a "dataFiltered" event with the filtered data', function() {
          expect('dataFiltered').toHaveBeenTriggeredOnAndWith(
            document,
            {
              featureIds: [mock.data.features[0].id]
            });
        });
        it('emits a "dataFacets" event with the filtered values for each facet', function() {
          expect('dataFacets').toHaveBeenTriggeredOnAndWith(
            document,
            {community: [
              {value: 'Greenfield', count: 1, selected: false},
              {value: 'Northampton', count: 1, selected: true},
              {value: 'Shellbourne Falls', count: 1, selected: false}
            ]
            });
        });
      });
      describe("list value facet", function() {
        beforeEach(function() {
          this.component.trigger('config', mock.config);
          this.component.trigger('data', mock.data);
          this.component.trigger('uiFilterFacet', {
            facet: 'services_offered',
            selected: ['social group']
          });
          waits(100);
        });
        it('emits a "dataFiltered" event with the filtered data', function() {
          expect('dataFiltered').toHaveBeenTriggeredOnAndWith(
            document,
            {featureIds: [mock.data.features[0].id,
                           mock.data.features[1].id]
            });
        });
        it('emits a "dataFacets" event with the filtered values for each facet', function() {
          expect('dataFacets').toHaveBeenTriggeredOnAndWith(
            document,
            {services_offered: [
              {value: 'public education', count: 0, selected: false},
              {value: 'social group', count: 2, selected: true},
              {value: 'support group', count: 2, selected: false}
            ]
            });
        });
      });
      describe("map facet", function() {
        describe('value not provided', function() {
          beforeEach(function() {
            var config = _.clone(mock.config);
            config.facets = {
              map: {
                title: "Map",
                text: "Limit results",
                type: 'map'
              }
            };
            this.component.trigger('config', config);
            this.component.trigger('data', mock.data);
            this.component.trigger('mapBounds', {
              southWest: [42.3251, -71.6411],
              northEast: [42.3250, -72.6412]
            });
            this.component.trigger('uiFilterFacet', {
              facet: 'map',
              selected: ['Limit results']
            });
            waits(50);
          });
          it('emits a "dataFiltered" event with the filtered data', function() {
            expect('dataFiltered').toHaveBeenTriggeredOnAndWith(
              document,
              {
                featureIds: [mock.data.features[0].id]
              });
          });
          it('emits a "dataFacets" event with the filtered values for each facet', function() {
            expect('dataFacets').toHaveBeenTriggeredOnAndWith(
              document,
              {map: [
                {value: 'Limit results', count: 1, selected: true}
              ]
              });
          });
        });
        describe('if value: true is configured', function() {
          beforeEach(function() {
            var config = _.clone(mock.config);
            config.facets = {
              map: {
                title: "Map",
                text: "Limit results",
                type: 'map',
                value: true
              }
            };
            this.component.trigger('config', config);
            this.component.trigger('data', mock.data);
            waits(50);
          });
          it('the facet defaults to selected', function() {
            expect('dataFacets').toHaveBeenTriggeredOnAndWith(
              document,
              {map: [
                {value: 'Limit results', count: 3, selected: true}
              ]
              });
          });
        });
      });
      describe("multiple facets", function() {
        beforeEach(function() {
          var config = _.clone(mock.config);
          config.facets.community = {
            title: "Community",
            type: 'single'
          };
          this.component.trigger('config', config);
          this.component.trigger('data', mock.data);
          this.component.trigger('uiFilterFacet', {
            facet: 'services_offered',
            selected: ['social group']
          });
          waits(100);
        });
        it('emits a "dataFiltered" event with the filtered data', function() {
          expect('dataFiltered').toHaveBeenTriggeredOnAndWith(
            document,
            {featureIds: [mock.data.features[0].id,
                          mock.data.features[1].id]
            });
          this.component.trigger('uiFilterFacet', {
            facet: 'community',
            selected: ['Northampton']
          });
          waits(25);
          runs(function() {
            expect('dataFiltered').toHaveBeenTriggeredOnAndWith(
              document,
              {featureIds: [mock.data.features[0].id]
              });
          });
        });
        it('emits a "dataFacets" event with the filtered values for each facet', function() {
          expect('dataFacets').toHaveBeenTriggeredOnAndWith(
            document,
            {
              community: [
                {value: 'Greenfield', count: 1, selected: false},
                {value: 'Northampton', count: 1, selected: false},
                {value: 'Shellbourne Falls', count: 0, selected: false}
              ],
              services_offered: [
                {value: 'public education', count: 0, selected: false},
                {value: 'social group', count: 2, selected: true},
                {value: 'support group', count: 2, selected: false}
              ]
            });
          this.component.trigger('uiFilterFacet', {
            facet: 'community',
            selected: ['Northampton']
          });
          waits(100);
          runs(function() {
            expect('dataFacets').toHaveBeenTriggeredOnAndWith(
              document,
              {
                community: [
                  {value: 'Greenfield', count: 1, selected: false},
                  {value: 'Northampton', count: 1, selected: true},
                  {value: 'Shellbourne Falls', count: 0, selected: false}
                ],
                services_offered: [
                  {value: 'public education', count: 0, selected: false},
                  {value: 'social group', count: 1, selected: true},
                  {value: 'support group', count: 1, selected: false}
                ]
              });
          });
        });
        it('does not filter away matching simple facets', function() {
          this.component.trigger('uiFilterFacet', {
            facet: 'services_offered',
            selected: ['public education']
          });
          waits(100);
          runs(function() {
            expect('dataFacets').toHaveBeenTriggeredOnAndWith(
              document,
              {
                community: [
                  {value: 'Greenfield', count: 0, selected: false},
                  {value: 'Northampton', count: 0, selected: false},
                  {value: 'Shellbourne Falls', count: 1, selected: false}
                ],
                services_offered: [
                  {value: 'public education', count: 1, selected: true},
                  {value: 'social group', count: 0, selected: false},
                  {value: 'support group', count: 1, selected: false}
                ]
              });
          });
        });
      });
    });
    describe('on uiClearFacets', function() {
      beforeEach(function() {
        this.component.trigger('config', mock.config);
        this.component.trigger('data', mock.data);
        this.component.trigger('uiFilterFacet', {
            facet: 'community',
            selected: ['Northampton']            
        });
      });
      it('emits a "dataFacets" event with no facets selected', function() {
        this.component.trigger('uiClearFacets', {"facet" : "community"});
        waits(100);
        runs(function() {
          expect('dataFacets').toHaveBeenTriggeredOnAndWithFuzzy(
            document,
            {community: [
              {selected: false},
              {selected: false},
              {selected: false}]
            });
        });
      });  
    });
  });
});
