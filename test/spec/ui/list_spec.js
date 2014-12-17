define(
  ['test/mock', 'infotemplates', 'jquery'],
  function(mock, templates, $) {
    'use strict';
    describeComponent('ui/list', function() {
      beforeEach(function() {
        setupComponent();
      });

      describe('on config', function() {
        it("calls teardown if there's no list configuration", function() {
          spyOn(this.component, 'teardown').andCallThrough();
          $(document).trigger('config', {});
          expect(this.component.teardown).toHaveBeenCalledWith();
        });

        it("makes the node visible if there is a list config", function() {
          this.$node.css('display', 'none');
          $(document).trigger('config', mock.config);
          expect(this.$node.css('display')).not.toEqual('none');
        });
      });

      describe('on data', function() {
        beforeEach(function() {
          $(document).trigger('config', mock.config);
          $(document).trigger('data', mock.data);
          waits(25);
        });

        it('creates a list item for each feature', function() {
          expect(this.$node.find('li').length).toEqual(
            mock.data.features.length);
        });

        it('renders the list config into the list items', function() {
          var $li = this.$node.find('li:eq(0)');
          var feature = $li.data('feature');
          expect($li.html()).toEqual(
            templates.popup(mock.config.list, feature.properties));
        });

        it('sorts the list items by their text', function() {
          var texts = this.$node.find('li').map(function() {
            return this.innerText;
          }).get();
          var sorted = texts.slice();
          sorted = sorted.sort();
          expect(texts).toEqual(sorted);
        });
      });

      describe('on item click', function() {
        beforeEach(function() {
          $(document).trigger('config', mock.config);
          $(document).trigger('data', mock.data);
          waits(25);
        });
        it('triggers a selectFeature event', function() {
          var spy = spyOnEvent(document, 'selectFeature');
          var $li = this.$node.find('li:eq(1)');

          $li.click();
          expect(spy).toHaveBeenTriggeredOnAndWith(document,
                                                   $li.data('feature'));
        });
      });

      describe('on selectFeature', function() {
        beforeEach(function() {
          $(document).trigger('config', mock.config);
          $(document).trigger('data', mock.data);
          waits(25);
        });

        it('scrolls to the selected feature', function() {
          spyOn(this.component, 'scrollToOffset');

          var $li = this.$node.find('li:eq(1)');
          var feature = $li.data('feature');

          $(document).trigger('selectFeature', feature);
          expect(this.component.scrollToOffset).toHaveBeenCalledWith(
            $li.offset().top - 50);
        });
      });
    });
  });
