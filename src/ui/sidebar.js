define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');


  module.exports = flight.component(function sidebar() {

    this.defaultAttrs({
      listButton: '.select-list',
      facetButton: '.select-facet',
      list: '#list',
      facet: '#facets'
    });


    this.showList = function(e){
      e.preventDefault();
      this.select('list').show();
      this.select('facet').hide();
      this.select('listButton').addClass('active');
      this.select('facetButton').removeClass('active');
    };

    this.showFacet = function(e){
      e.preventDefault();
      this.select('facet').show();
      this.select('list').hide();
      this.select('facetButton').addClass('active');
      this.select('listButton').removeClass('active');
    };

    this.showFullSidebar = function() {
      this.select('facet').show();
      this.select('list').show();
    };

    this.toggleSidebar = function(e) {
      e.preventDefault();
      this.$node.toggleClass('open');
      $('.sidebar-toggle').toggleClass('active');
    };

    this.after('initialize', function() {
      this.on('click', {
        listButton: this.showList,
        facetButton: this.showFacet
      });

      // This is outside of the component, but it controls it.. perhaps refactor to include within root element?
      $(document).on('click', '.sidebar-toggle', this.toggleSidebar.bind(this) );
      $(window).on('resize', function(){
        if( document.body.clientWidth > 955 ) {
          this.showFullSidebar();
        }
      }.bind(this));


    });
  });
});
