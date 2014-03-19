define(function(require) {
    'use strict';
    require('bootstrap');
    // attach components to the DOM
    require('ui/map').attachTo('#map');
    require('ui/search').attachTo('#search', {mapSelector: '#map'});
    require('ui/info').attachTo('#info');
    require('ui/facet').attachTo('#facets');
    require('data/facet').attachTo(document);
    require('ui/project').attachTo(document);
    require('data/analytics').attachTo(document);
    require('data/loader').attachTo(document);
  });
