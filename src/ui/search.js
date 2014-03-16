define(
  ['flight',
   'jquery',
   'lodash'],
  function(flight, $, _) {
    'use strict';
    var search = function() {
      this.defaultAttrs({
        searchSelector: 'input',
        searchUrl: '//nominatim.openstreetmap.org/search'
      });
      this.configureSearch = function(ev, config) {
        if (config.search && config.search.geosearch) {
          this.maxBounds = config.map.maxBounds;
          this.$node.show();
        } else {
          this.$node.hide();
        }
      };

      this.search = function(ev) {
        ev.preventDefault();
        var address = this.select('searchSelector').val(),
            parameters = {
              format: "json",
              addressdetails: 1,
              q: address
            };
        if (!address) {
          return;
        }
        this.trigger(document, 'uiSearch', {query: address});
        if (this.maxBounds) {
          parameters.viewbox = [
            this.maxBounds[0][0], this.maxBounds[0][1],
            this.maxBounds[1][0], this.maxBounds[1][1]].join(',');
        }
        $.getJSON(this.attr.searchUrl,
                  parameters,
                  this.searchResults.bind(this));
      };

      this.searchResults = function(results) {
        if (results.length) {
          var location = results[0],
              displayName = _.compact([
                location.address.road,
                location.address.city,
                location.address.state]).join(', ');
          this.select('searchSelector').attr('placeholder',
                                             displayName).val('');
          this.trigger(this.attr.mapSelector,
                       'panTo',
                       {lat: location.lat,
                        lng: location.lon});
        }
      };

      this.after('initialize', function() {
        this.on('submit', this.search);
        this.on(document, 'config', this.configureSearch);
      });
    };

    return flight.component(search);
  });
