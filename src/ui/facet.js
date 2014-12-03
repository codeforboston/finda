define(function(require, exports, module) {
  'use strict';
  // compile all the templates
  var flight = require('flight');
  var Handlebars = require('handlebars');
  var _ = require('lodash');
  var $ = require('jquery');
  var templates = {
    input: Handlebars.compile('<div class="checkbox {{#selected}}selected{{/selected}}"><label><input type="checkbox" {{#selected}}checked{{/selected}} name="{{ value }}">{{ value }} {{#selected}}{{else}}({{ count }}){{/selected}}</label></div>'),
    form: Handlebars.compile('<form data-facet="{{ key }}">{{#inputs}}{{{this}}}{{/inputs}}</form>'),
    facet: Handlebars.compile('<h4>{{title}}</h4><p data-facet="{{ key }}"id="clear-facets" class="{{#unless has_selected}}hide{{/unless}}">Clear all</p>{{{form}}}')
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
              var has_selected = !!(_.find(values, function(value) { return value.selected === true; }));
              // render a template for each facet
              return templates.facet({
                title: this.facetConfig[key].title,
                has_selected: has_selected,
                key: key,
                // render the form for each value of the facet
                form: templates.form({
                  key: key,
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
      //TODO: this looks out of place but i could not do bind any earlier, 
      // as I don't know when the displayFacets is being called. Advice?
      this.on('#clear-facets', 'click', this.clearFacets);
    };

    this.clearFacets = function(ev) {
      // TODO: right now, both form and this target(the p tag) will own references to facet. 
      // should there only be one owner? who should it be?
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

    this.after('initialize', function() {
      this.on('change', this.selectFacet);
      this.on(document, 'config', this.configureFacets);
      this.on(document, 'dataFacets', this.displayFacets);
    });
  });
});
