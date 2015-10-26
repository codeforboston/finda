define(
  ['test/mock'],
  function(mock) {
    'use strict';
    describeComponent('ui/tabs', function() {
      beforeEach(function() {
        setupComponent();
      });

      describe('on results-tab click', function() {
        it("Removes survey-tabs class", function() {
          this.$node.html('<div class="survey-tabs"><a id="results-tab"></a></div>');
          this.component.setupClickHandlers();

          this.$node.find('#results-tab').click();
          expect(this.$node.find('.survey-tabs').length).toBe(0);
        });
      });
    });
  });
