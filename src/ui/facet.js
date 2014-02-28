define(
  ['flight', 'handlebars', 'lodash', 'jquery'],
  function(flight, Handlebars, _, $) {
    'use strict';
    // compile all the templates
    var templates = {
      input: Handlebars.compile('<div class="checkbox"><label><input type="checkbox" {{#selected}}checked{{/selected}} name="{{ value }}">{{ value }} ({{ count}})</label></div>'),
      form: Handlebars.compile('<form data-facet="{{ key }}">{{#inputs}}{{{this}}}{{/inputs}}</form>'),
      facet: Handlebars.compile('<h4>{{title}}</h4>{{{form}}}')
    };

    var facet = function() {
      this.configureFacets = function(ev, config) {
        this.facetConfig = config.facets;
      };

      this.displayFacets = function(ev, facetData) {
        this.$node.html(
          _.chain(facetData)
            .map(
              _.bind(function(values, key) {
                // render a template for each facet
                return templates.facet({
                  title: this.facetConfig[key].title,
                  // render the form for each value of the facet
                  form: templates.form({
                    key: key,
                    inputs: _.chain(values)
                      .filter(function(o) { return o.count; })
                      .map(templates.input)
                      .value()
                  })
                });
              }, this))
            .value()
            .join('')
        ).show();
      };

      this.selectFacet = function(ev) {
        var $form = $(ev.target).parents('form'),
            facet = $form.data('facet'),
            selected = _.map($form.serializeArray(),
                             'name');
        $(document).trigger('uiFilterFacet', {
          facet: facet,
          selected: selected});
      };

      this.after('initialize', function() {
        this.on('click', this.selectFacet);
        this.on(document, 'config', this.configureFacets);
        this.on(document, 'dataFacets', this.displayFacets);
      });
    };

    return flight.component(facet);
  });
