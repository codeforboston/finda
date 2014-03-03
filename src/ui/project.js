define(
  ['flight', 'jquery', 'lodash'],
  function(flight, $, _) {
    'use strict';
    var project = function() {
      this.configureProject = function(ev, config) {
        _.mapValues(
          config.project,
          function(value, key) {
            // find everything with data-project="key", and replace the HTML
            // with what's in the configuration
            $("*[data-project=" + key + "]").html(value);
          });
      };

      this.after('initialize', function() {
        this.on(document, 'config', this.configureProject);
      });
    };

    return flight.component(project);
  });
