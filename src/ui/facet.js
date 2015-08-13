define(function(require, exports, module) {
  'use strict';
  // compile all the templates
  var flight = require('flight');
  var Handlebars = require('handlebars');
  var _ = require('lodash');
  var $ = require('jquery');
  var templates = {
    needTreatment: Handlebars.compile('<h4>Do you need treatment?</h4><div><a class="foo" data-next-facet-offset="0" href="#">yes</a></div><div><a data-callback="showNoTreatment" href="#">no</a></div>'),
    input: Handlebars.compile('<div class="checkbox {{#selected}}selected{{/selected}}"><label><input type="checkbox" {{#selected}}checked{{/selected}} name="{{ value }}">{{ value }} {{#selected}}{{else}}({{ count }}){{/selected}}</label></div>'),
    form: Handlebars.compile('<form data-facet="{{ key }}">{{#inputs}}{{{this}}}{{/inputs}}</form>'),
    facet: Handlebars.compile('<h4>{{title}}</h4>{{{form}}}')
  };

  module.exports = flight.component(function () {
    this.configureFacets = function(ev, config) {
      this.facetConfig = config.facets;
    };

    this.facetOffset = -1;

    this.displayFacets = function(ev, facetData) {
      if (facetData) {
        this.facetData = facetData;
      } else {
        facetData = this.facetData;
      }
      if (this.facetOffset === -1) {
        this.$node.html(
          templates.needTreatment()
        ).show();
        return
      }
      // facetData = {
      //   'needSomething': {
      //   }
      // }

      var facets = _.keys(facetData);
      var key = facets[this.facetOffset];
      var newFacetData = {};
      newFacetData[key] = facetData[key];
      facetData = newFacetData;
      // if (this.facetOffset === 0) {
      //   facetData = {
      //     "need_treatment":
      //       [
      //         {"value":"yes",
      //         "count":1,
      //         "selected":false},
      //         {"value":"no",
      //         "count":1,
      //         "selected":false}
      //       ]};
      // }

      var facet = _.chain(facetData)
        .map(
          _.bind(function(values, key) {
            // render a template for each facet
            return templates.facet({
              title: this.facetConfig[key].title,
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
      this.$node.html(
        facet +
          '<a class="" data-next-facet-offset="' + (this.facetOffset + 1) + '" href="#">next</a> ' +
          '<a data-next-facet-offset="' + (this.facetOffset - 1) + '" href="#">prev</a>'
      ).show();
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

    this.showNoTreatment = function() {
      this.$node.html("Thank you");
    }

    this.after('initialize', function() {
      // this.on(document, 'uiHideResults', function() {
      //   this.$node.hide();
      // });
      //
      this.on(document, 'uiShowResults', function() {
        this.$node.show();
      });

      this.on('click', function(ev, target) {
        var nextFacetOffset = $(ev.target).data('nextFacetOffset');
        var callback = $(ev.target).data('callback');
        if (nextFacetOffset !== undefined) {
          this.facetOffset = nextFacetOffset;
          this.displayFacets();
        } else if (callback) {
          this[callback](ev, target);
        }
      }.bind(this));
      this.on('change', this.selectFacet);
      this.on(document, 'config', this.configureFacets);
      this.on(document, 'dataFacets', this.displayFacets);

      this.on(document, 'uiFacetChangeRequest', function(ev, facet) {
        var input = $('input[name=' + facet.name + ']');
        input.prop('checked', true);
        input.trigger('change');
      });
    });
  });
});
