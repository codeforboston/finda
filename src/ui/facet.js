define(function(require, exports, module) {
  'use strict';
  // compile all the templates
  var flight = require('flight');
  var Handlebars = require('handlebars');
  var _ = require('lodash');
  var $ = require('jquery');
  var templates = {
    input: Handlebars.compile('<div class="checkbox {{#selected}}selected{{/selected}}"><label><input type="checkbox" {{#selected}}checked{{/selected}} name="{{ value }}">{{ value }} {{#selected}}{{else}}({{ count }}){{/selected}}</label></div>'),
    form: Handlebars.compile('<span data-facet="{{ key }}" class="clear-facets {{#unless has_selected}}hide{{/unless}}">clear</span><form data-facet="{{ key }}">{{#inputs}}{{{this}}}{{/inputs}}</form>'),
    facet: Handlebars.compile('<h4>{{title}}</h4>{{{form}}}')
  };

  module.exports = flight.component(function () {
    this.configureFacets = function(ev, config) {
      this.facetConfig = config.facets;
    };

    this.displayFacets = function(ev, facetData) {
      this.$node.html(
        _.chain(facetData)
          .map(
            _.bind(function(values, key) {
              var has_selected = _.some(values, 'selected');
              // render a template for each facet
              return templates.facet({
                title: this.facetConfig[key].title,
                key: key,
                // render the form for each value of the facet
                form: templates.form({
                  key: key,
                  has_selected: has_selected,
                  inputs: _.chain(values)
                    .filter('count')
                    .map(templates.input)
                    .value()
                })
              });
            }, this))
          .value()
          .join('')
      ).show();
    };

    this.clearFacets = function(ev) {
      var facet = $(ev.target).data('facet');
      $(document).trigger('uiClearFacets', {
        facet: facet
      });
    };

    this.selectFacet = function(ev) {
      var $form = $(ev.target).parents('form'),
          facet = $form.data('facet'),
          selected = _.map($form.serializeArray(),
                           'name');
      window.setTimeout(function() {
        $(document).trigger('uiFilterFacet', {
          facet: facet,
          selected: selected
        });
      }, 0);
    };

    this.defaultAttrs({ // defaultAttrs is now deprecated in favor of 'attributes', but our version of flight still uses this.
      clearFacetsSelector : ".clear-facets"
    });

    this.after('initialize', function() {
      this.on('change', this.selectFacet);
      this.on(document, 'config', this.configureFacets);
      this.on(document, 'dataFacets', this.displayFacets);
      this.on('click', { clearFacetsSelector : this.clearFacets });
    });
  });
});
