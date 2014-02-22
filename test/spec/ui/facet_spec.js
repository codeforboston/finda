'use strict';
define(['test/mock'], function(mock) {
  describeComponent('ui/facet', function() {
    beforeEach(function() {
      setupComponent();
      spyOnEvent(document, 'uiFilterFacet');
    });
    describe('on config', function() {
      it('stores the facet config', function() {
        $(document).trigger('config', mock.config);
        expect(this.component.facetConfig).toEqual(
          mock.config.facets);
      });
    });
    describe('on dataFacets', function() {
      beforeEach(function() {
        this.component.trigger('config', mock.config);
        this.component.trigger('dataFacets', {
          'services_offered': ['first',
                               'second',
                               'third']});
      });
      it('renders the name of the facet in an h4', function() {
        expect(this.$node.find('h4').text()).toEqual('Services');
      });
      it('renders each facet value as a checkbox', function() {
        expect(this.$node.find('input').length).toEqual(3);
        expect(this.$node.find('input:first').attr('name')).toEqual('first');
      });
    });

    describe('on click', function() {
      beforeEach(function() {
        this.component.trigger('config', mock.config);
        this.component.trigger('dataFacets', {
          'services_offered': ['first',
                               'second',
                               'third']});
      });
      it('sends a "uiFilterFacet" event with the selected facets', function () {
        this.component.$node.find('input:eq(1)').click();
        expect('uiFilterFacet').toHaveBeenTriggeredOnAndWith(
          document,
          {facet: 'services_offered',
           selected: ['second']
          });
        this.component.$node.find('input:eq(2)').click();
        expect('uiFilterFacet').toHaveBeenTriggeredOnAndWith(
          document,
          {facet: 'services_offered',
           selected: ['second', 'third']
          });
      });
      it('sends a "uiFilterFacet" event with no facets', function () {
        this.component.$node.find('input:eq(1)').click();
        this.component.$node.find('input:eq(1)').click();
        expect('uiFilterFacet').toHaveBeenTriggeredOnAndWith(
          document,
          {facet: 'services_offered',
           selected: []
          });
      });
    });
  });
});
