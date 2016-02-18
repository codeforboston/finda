define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  var _ = require('lodash');


  module.exports = flight.component(function sidebar() {

    var potentialSidebarItems = ['facets', 'list'];
    var presentItems = [];

    this.defaultAttrs({
      toggleButtons:  '.sidebar-action',
      sidebarItems:   '.sidebar-item',
      sidebarToggle:  '.sidebar-toggle'
    });

    this.configureSidebar = function(e, config){
      var configAttr = _.keys(config);
      presentItems = _.intersection(potentialSidebarItems, configAttr);

      var $sidebar = this.$node;

      // add class .sidebar-items-X based on active sidebar items
      $sidebar.addClass('sidebar-items-'+presentItems.length);
      // activate configured sidebar items
      _.each(presentItems, function(item){
        $sidebar.find(item).show();
        $sidebar.find('[data-select="'+item+'"]').parent().show();
      });

      if( presentItems.length === 1) {
        $sidebar.find('.sidebar-nav').hide();
        $sidebar.addClass('no-tabs');
      }
    };

    this.showItem = function(e, elemObj) {
      // generic toggle fn for sidebar tabs
      e.preventDefault();
      var $el = $(elemObj.el);
      var itemTitle = $el.data('select');
      this.select('sidebarItems').hide();
      this.$node.find('#'+itemTitle).show();
      this.select('toggleButtons').removeClass('active');
      $el.addClass('active');
    };

    this.showFullSidebar = function() {
      var $sidebar = this.$node;
      _.each(presentItems, function(item){
        $sidebar.find(item).show();
      });
    };

    this.toggleHiddenSidebar = function(e) {
      e.preventDefault();
      this.$node.toggleClass('open');
      $('.sidebar-toggle').toggleClass('active');
    };

    this.after('initialize', function() {
      this.on(document, 'config', this.configureSidebar);

      this.on('click', {
        toggleButtons: this.showItem,
        sidebarToggle: this.toggleHiddenSidebar
      });


      $(window).on('resize', function(){
        if( document.body.clientWidth > 955 ) {
          this.showFullSidebar();
        }
      }.bind(this));

    });
  });
});
