'use strict';
define(
  ['handlebars', 'underscore'],
  function(Handlebars, _) {
    var templates = {
      url: Handlebars.compile('<a href={{url}}>{{title}}</a>'),
      title: Handlebars.compile('<div><h4>{{title}}</h4><div>{{{text}}}</div></div>'),
      list: Handlebars.compile('<ul> {{#list}} <li>{{{this}}}</li> {{/list}} <ul>'),
      simple: Handlebars.compile('{{{text}}}'),
      popup: Handlebars.compile('<div>{{#popup}}<div id="{{div_id}}">{{{value}}}</div>{{/popup}}</div>')
    },
        formatters = {
          url: function(value, property) {
            var title = property.title || '[link]';
            return templates.url({title: title,
                                  url: value});
          },

          title: function(value, property) {
            return templates.title({title: property.title,
                                    text: format(value)});
          },

          list: function(value, property) {
            if (value.length === 0) {
              return '';
            } else if (value.length === 1) {
              return formatters.simple(value[0], property);
            }
            return templates.list({
              list: _.map(value, formatters.simple)
            });
          },

          simple: function(value) {
            value = value.replace(/\n/g, '<br />');
            return templates.simple({text: value});
          }
        },

        format = function(value, property) {
          property = property || {};
          var formatter;
          if (property.url) {
            formatter = 'url';
          } else if (property.title) {
            formatter = 'title';
          } else if (_.isArray(value)) {
            formatter = 'list';
          } else {
            formatter = 'simple';
          }
          // apply the discovered formatter to the data
          return formatters[formatter](value, property);
        };

    return function(properties, feature) {
      var popup = [],
          rendered;
      _.each(properties, function(property, key) {
        var value = feature[key];
        rendered = format(value, property);
        if (rendered) {
          popup.push({
            div_id: key,
            value: rendered
          });
        }
      });
      return templates.popup({popup: popup});
    };
  });
