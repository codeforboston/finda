define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  var templates = require('infotemplates');
  module.exports = flight.component(function info() {
    this.defaultAttrs({
      "contentClass": "content",
      "closeSelector": ".close"
    });

    this.configureInfo = function(ev, config) {
      this.infoConfig = config.properties;
      this.editMode = config.edit_mode;
      if (this.editMode) {
        this.editSchema = config.feature_property_json_schema;
      }
    };

    this.update = function(ev, feature) {
      if (!feature) {
        return;
      }
      this.attr.currentFeature = feature;
      var content = this.$node.find("div." + this.attr.contentClass);
      if (!content.length) {
        content = $("<div/>").addClass(this.attr.contentClass).
          appendTo(this.$node);
      }
      if (this.editMode) {
        this.startEditing(content, feature.properties);
      }
      else {
        var popup = templates.popup(this.infoConfig,
                                    feature.properties);
        content.html(popup);
      }
      
      this.$node.show();
    };

    this.startEditing = function(contentNode, props) {
      this.killCurrentEditor(); // in case we had one...
      var editor = new JSONEditor(contentNode[0], {
        schema: this.editSchema,
        startval: _.cloneDeep(props),
        theme: "bootstrap3"
      });
      this.currentEditor = editor;
      editor.on('change', function() {
        $(document).trigger('selectedFeaturePropsChanged', 
                            editor.getValue());
      });
    }

    this.killCurrentEditor = function() {
      if (this.currentEditor) {
        this.currentEditor.destroy();
        this.currentEditor = undefined;
      }
    }

    this.hide = function() {
      this.$node.hide();
      this.killCurrentEditor();
      this.trigger(document, 'deselectFeature', this.attr.currentFeature);
      this.attr.currentFeature = null;
    };

    this.after('initialize', function() {
      this.on(document, 'config', this.configureInfo);
      this.on(document, 'selectFeature', this.update);
      this.on(this.select('closeSelector'), 'click', this.hide);
    });
  });
});
