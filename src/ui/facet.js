define(function(require, exports, module) {
  'use strict';
  // compile all the templates
  var flight = require('flight');
  var Handlebars = require('handlebars');
  var _ = require('lodash');
  var $ = require('jquery');
  var templates = {
    needTreatment: Handlebars.compile('<h4>Do you need treatment?</h4><div><a class="foo" data-next-facet-offset="0" href="#">yes</a></div><div><a data-callback="showNoTreatment" href="#">no</a></div>'),
    input: Handlebars.compile('<div class="checkbox {{#selected}}selected{{/selected}}"><label><input type="checkbox" {{#selected}}checked{{/selected}} name="{{ value }}">{{#if title}}{{ title }}{{else}}{{ value }}{{/if}} {{#selected}}{{else}}({{ count }}){{/selected}}</label></div>'),
    form: Handlebars.compile('<form data-facet="{{ key }}">{{#inputs}}{{{this}}}{{/inputs}}</form>'),
    facet: Handlebars.compile('<h4>{{{title}}}</h4>{{{form}}}'),
    facetControls: Handlebars.compile('{{#if showResults}}<a class="js-offer-results" data-offer-results="false" href="#">Back to Survey</a>{{else}}<a href="#"><button data-next-facet-offset="{{facetOffset}}" class="js-next-prev btn btn-default">Next</button></a> <a class="js-offer-results" data-offer-results="true" href="#">Skip to Facilities</a>{{/if}}')
  };

  module.exports = flight.component(function () {
    this.configureFacets = function(ev, config) {
      this.facetConfig = config.facets;
    };

    // -1 is start with intro question that is not a facet
    this.facetOffset = -1;
    this.facetOffset = 0;

    this.meetsFacetDependency = function(facetData, key, dependency) {
      return _.find(facetData, function(facets) {
        return _.find(facets, function(facet) {
          return facet.value === dependency && facet.selected;
        });
      });
    };

    this.getFacetConfig = function(key, attr) {
      if (this.facetConfig[key]) {
        return this.facetConfig[key][attr];
      }
    };

    this.displayFacets = function(ev, facetData) {
      // cache facet data so that you can call it internally instead of waiting for event from data facet
      if (facetData) {
        this.facetData = facetData;
      } else {
        facetData = this.facetData;
      }
      if (this.facetOffset === -1) {
        this.$node.html(
          templates.needTreatment()
        ).show();
        return;
      }

      var facets = _.keys(facetData);
      var key = facets[this.facetOffset];
      if (! this.showAllFacets) {
        // does the facet have a dependency?
        if (key) {
          var dependency = this.getFacetConfig(key, "dependency");
          if (dependency) {
            if (! this.meetsFacetDependency(facetData, key, dependency)) {
              this.facetOffset += 1;
              return this.displayFacets();
            }
          }
        }

        var newFacetData = {};
        newFacetData[key] = facetData[key];
        facetData = newFacetData;
      }

      var facet = _.chain(facetData)
        .map(
          _.bind(function(values, key) {
            // render a template for each facet
            return templates.facet({
              title: this.getFacetConfig(key, (this.showAllFacets ? "title" : "survey_title")),
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
        .join('');
      this.$node.html(
        facet +
        templates.facetControls({
          showResults: this.showAllFacets,
          facetOffset: this.facetOffset + 1
        })
      ).show();

      this.on('.js-next-prev', 'click', function(ev) {
        var nextFacetOffset = $(ev.target).data('nextFacetOffset');
        this.facetOffset = nextFacetOffset;
        console.log(this.facetOffset);
        this.displayFacets();
      });

      this.on('.js-offer-results', 'click', function(ev) {
        // can be true or false
        var offerResults = $(ev.target).data('offerResults');
        this.showAllFacets = offerResults;
        if (this.showAllFacets) {
          $('#facets').addClass('control-sidebar');
          $(document).trigger('uiShowResults', {});
        } else {
          $('#facets').removeClass('control-sidebar');
          $('#facets').addClass('control-survey');
          $(document).trigger('uiHideResults', {});
          // $(document).trigger('uiShowSurvey', {});
        }
        this.displayFacets();
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

    this.showNoTreatment = function() {
      this.$node.html("Thank you");
    };

    // EDS todo: localize the click handlers so we don't have to ask questions about what type of event it was
    this.handleClicks = function(ev, target) {
      var callback = $(ev.target).data('callback');

      if (callback) {
        return this[callback](ev, target);
      }
      this.displayFacets();
    };

    this.after('initialize', function() {
      // this.on('click', this.handleClicks);

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
