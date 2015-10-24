define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var _ = require('lodash');
  var $ = require('jquery');
  var templates = require('infotemplates');
  var timedWithObject = require('timed_with_object');

  module.exports = flight.component(function list() {
    this.defaultAttrs({
      listItemSelector: 'li'
    });

    function $elementForFeature(feature) {
      var liArray = this.$node.find('li').filter(function() {
        var nodeFeature = $(this).data('feature');
        if (!nodeFeature) {
          return false;
        }
        return _.isEqual(nodeFeature, feature);
      });
      return $(liArray[0]);
    }

    function compareListItems(a, b) {
      a = a._text;
      b = b._text;
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    }

    this.configureList = function(ev, config) {
      var listConfig = config.list;
      if (!listConfig) {
        this.teardown();
        return;
      }
      this.trigger('listStarted', {});
      this.render = _.partial(templates.popup, config.list);
      this.renderFull = _.partial(templates.popup, config.properties);
    };

    this.loadData = function(ev, data) {
      var $ul = this.$node.empty().html('<ul></ul>').find('ul');
      timedWithObject(
        data.features,
        function(feature, l) {
          var $li = $("<li/>").html(this.render(feature.properties))
                .addClass('item')
                .data('feature', feature);
          $li._text = $li.text();
          l.push($li);
          return l;
        },
        [],
        this).then(function(l) {
          l.sort(compareListItems);
          $ul.append(l);
          this.trigger('listFinished', {});
        }.bind(this));
    };

    this.filterData = function(ev, data) {
      this.trigger('listFilteringStarted', {});
      this.$node.find('li.item').hide().filter(function() {
        var $li = $(this);
        return _.contains(data.featureIds, $li.data('feature').id);
      }).show();
      this.trigger('listFinished', {});
    };

    this.onFeatureClick = function onFeatureClick(ev) {
      var $li = $(ev.target).closest('li.item');
      var feature = $li.data('feature');
      this.selectedLi = $li;
      this.trigger('selectFeature', feature);
    };

    this.onFeatureSelected = function onFeatureSelected(ev, feature) {
      var $selectedItem = $elementForFeature.call(this, feature);
      var offset = $selectedItem.offset().top - 50;
      var propsWithTitles = this.addFacetTitles(feature.properties, this.facetTitles);
      $selectedItem.html(this.renderFull(propsWithTitles));
      this.scrollToOffset(offset);
    };

    this.addFacetTitles = function(featureProperties, facetTitles) {
      var propsWithTitles = _.clone(featureProperties);
      // can probably use map rather than each
      _.each(propsWithTitles, function(values, key) {
        if (facetTitles && _.isArray(values)) {
          propsWithTitles[key] = _.map(values, function(value) {
            return facetTitles[value];
          }.bind(this));
        }
      }.bind(this));
      return propsWithTitles;
    };

    this.scrollToOffset = function(offset) {
      this.$node.scrollTop(this.$node.scrollTop() + offset);
    };

    this.after('initialize', function() {
      this.on(document, 'config', this.configureList);
      this.on(document, 'data', this.loadData);
      this.on(document, 'dataFiltered', this.filterData);
      this.on(document, 'selectFeature', this.onFeatureSelected);
      this.on('click', {
        listItemSelector: this.onFeatureClick
      });
      this.on(document, 'uiShowResults', function() {
        // this.$node.show();
        $('#results-tab').click();
      });
      this.on(document, 'uiHideResults', function() {
        this.$node.hide();
      });
      this.on(document, 'facetTitles', function(ev, facetTitles) {
        this.facetTitles = facetTitles;
      });
    });
  });
});
