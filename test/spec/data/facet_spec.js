'use strict';
define(['test/mock'], function(mock) {
  describeComponent('data/facet', function() {
    beforeEach(function() {
      setupComponent();
      spyOnEvent(document, 'dataFacets');
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
          {services_offered: ['public education', 'social group',
                              'support group']
          });
      });
    });
  });
});
