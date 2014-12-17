define(['jquery'], function($) {
  'use strict';
  describeComponent('ui/loading', function() {
    beforeEach(function() {
      setupComponent('<div class="modal"><h4></h4></div>', {
        contentSelector: 'h4'
      });
      spyOn(this.$node, 'modal');
    });

    describe('loading', function() {
      it("displays a loading message on loading events", function() {
        $(document).trigger('mapStarted', {});
        expect(this.component.select('contentSelector').text()).toEqual(
          this.component.attr.loadingText);
      });
    });

    describe("filtering", function() {
      it("displays a filtering message on filtering events", function() {
        $(document).trigger('dataFilteringStarted', {});
        expect(this.component.select('contentSelector').text()).toEqual(
          this.component.attr.filteringText);
      });
    });


    describe("the modal", function() {
      beforeEach(function() {
        $(document).trigger('mapStarted', {});
      });
      it("is shown loading events", function() {
        expect(this.$node.modal).toHaveBeenCalledWith({
          keyboard: false
        });
      });
      it("isn't re-shown a second time", function() {
        $(document).trigger('listStarted', {});
        expect(this.$node.modal.callCount).toEqual(1);
      });
      it("doesn't hide the modal if things are still loading", function() {
        $(document).trigger('listStarted', {});
        $(document).trigger('mapFinished', {});
        expect(this.$node.modal).not.toHaveBeenCalledWith('hide');
      });
      it("hides when all finish events is triggered", function() {
        $(document).trigger('listStarted', {});
        $(document).trigger('mapFinished', {});
        $(document).trigger('listFinished', {});
        expect(this.$node.modal).toHaveBeenCalledWith('hide');
      });
    });
  });
});
