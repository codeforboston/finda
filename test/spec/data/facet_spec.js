'use strict';
define(['test/mock'], function(mock) {
  describeComponent('data/facet', function() {
    beforeEach(function() {
      setupComponent();
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
      it('records the data', function() {
        expect(this.component.attr.data).toEqual(mock.data);
      });
      it('records the values for each facet', function() {
        expect(this.component.attr.facets).toEqual({
          services_offered: ['support group', 'social group',
                             'public education']
        });
      });
    });
  });
});
