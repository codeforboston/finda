define(['test/mock', 'jquery'], function(mock, $) {
  'use strict';
  describeComponent('ui/facet', function() {
    var mockFacets = {
      'services_offered': [{value: 'first', count: 1},
                           {value: 'second', count: 2, selected: true},
                           {value: 'third', count: 0}]
    };

    beforeEach(function() {
      setupComponent();
      spyOnEvent(document, 'uiFilterFacet');
      spyOnEvent(document, 'uiClearFacets');
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
        this.component.trigger('dataFacets', mockFacets);
      });
      it('renders the name of the facet in an h4', function() {
        expect(this.$node.find('h4').text()).toEqual('Services');
      });
      it('renders each facet value as a checkbox', function() {
        expect(this.$node.find('input').length).toEqual(2);
        expect(this.$node.find('input:first').attr('name')).toEqual('first');
      });
      it('renders the label with the count', function() {
        var text = this.$node.find("label:first").text();
        expect(text).toContain('first');
        expect(text).toContain(1);
      });
      it('renders a checked checkbox if selected is true', function() {
        expect(this.$node.find("input[name=second]").val()).toEqual('on');
      });
      it('does not render labels with a 0 count', function() {
        expect(this.$node.find("input[name=third]").length).toEqual(0);
      });
    });

    describe('on click', function() {
      // NB: "second" is already selected, per the mockFacets above
      beforeEach(function() {
        this.component.trigger('config', mock.config);
        this.component.trigger('dataFacets', mockFacets);
      });
      it('sends a "uiFilterFacet" event with the selected facets', function () {
        this.component.$node.find('input:first').click();
        waits(1);
        runs(function() {
          expect('uiFilterFacet').toHaveBeenTriggeredOnAndWith(
            document,
            {facet: 'services_offered',
             selected: ['first', 'second']
            });
        });
      });
      it('sends a "uiFilterFacet" event with no facets', function () {
        this.component.$node.find('input:eq(1)').click();
        waits(1);
        runs(function() {
          expect('uiFilterFacet').toHaveBeenTriggeredOnAndWith(
            document,
            {facet: 'services_offered',
             selected: []
            });
        });
      });
    });

    describe('on click clear facet', function() {
      beforeEach(function() {
        this.component.trigger('config', mock.config);
        this.component.trigger('dataFacets', mockFacets);
      });
      it('sends a "uiClearFacets" event', function () {
        this.component.$node.find('.clear-facets').click();
        waits(1);
        runs(function() {
          expect('uiClearFacets').toHaveBeenTriggeredOn(document);
        });
      });
    });
  });
});
