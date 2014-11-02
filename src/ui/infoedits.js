define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  var _ = require('lodash');
  var JSONEditor = window.JSONEditor;

  module.exports = flight.component(function infoedits() {

    this.defaultAttrs({
      "closeSelector": ".close"
    });

    this.configureInfo = function(ev, config) {
      this.enabled = config.edit_mode;
      this.editSchema = config.feature_property_json_schema;
    };

    this.update = function(ev, feature) {
      if (!feature || !this.enabled) {
        return;
      }
      this.attr.currentFeature = feature;
      var content = this.$node.find("div.editcontainer");
      if (!content.length) {
        content = $('<div class="editcontainer"/>').appendTo(this.$node);
      }
      this.startEditing(content, feature);
      this.$node.show();
    };

    this.startEditing = function(contentNode, feature) {
      this.killCurrentEditor(); // in case we had one...
      var editor = new JSONEditor(contentNode[0], {
        schema: this.editSchema,
        startval: _.cloneDeep(feature.properties),
        theme: "bootstrap3",
        iconlib: "bootstrap3",
        disable_collapse: true,
        disable_edit_json: true,
        required_by_default: true
      });
      this.currentEditor = editor;
      editor.on('change', function() {
        $(document).trigger('selectedFeaturePropsChanged',
                            editor.getValue());
      });

      // Add delete button.
      var deleteButton =
        $('<button class="btn btn-small pull-right btn-delete"/>');
      deleteButton.text(feature.deleted ? "Restore" : "Delete");
      this.$node.find("h3").first().prepend(deleteButton);

      deleteButton.on("click", function() {
        if (feature.deleted) {
          $(document).trigger('selectedFeatureUndeleted');
        }
        else {
          $(document).trigger('selectedFeatureDeleted');
        }
      });

      // In case we were scrolled down editing a previous feature,
      // scroll our pane back up to the top.
      this.$node.scrollTop(0);
    };

    this.markDeletion = function() {
      this.$node.find(".btn-delete").text("Restore");
    };

    this.markUndeletion = function() {
      this.$node.find(".btn-delete").text("Delete");
    };

    this.killCurrentEditor = function() {
      if (this.currentEditor) {
        this.currentEditor.destroy();
        this.currentEditor = undefined;
      }
    };

    this.hide = function() {
      this.$node.hide();
      this.killCurrentEditor();
      this.trigger(document, 'deselectFeature', this.attr.currentFeature);
      this.attr.currentFeature = null;
    };

    this.after('initialize', function() {
      this.on(document, 'config', this.configureInfo);
      this.on(document, 'selectFeature', this.update);
      this.on(document, 'selectedFeatureDeleted', this.markDeletion);
      this.on(document, 'selectedFeatureUndeleted', this.markUndeletion);
      this.on(this.select('closeSelector'), 'click', this.hide);
    });
  });
});
