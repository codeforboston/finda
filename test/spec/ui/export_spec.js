define(['test/mock', 'jquery'], function(mock, $) {

  'use strict';

  describeComponent('ui/export', function() {
    beforeEach(function() {
      setupComponent('<form id="export">foo:<input/></form>');
    });

    afterEach(function() {
      mock.config.edit_mode = false;
    });

    describe('on config', function() {

      it('hides widget if edit-mode is off', function() {
	spyOn(this.$node, 'hide');
	$(document).trigger('config', mock.config);
	expect(this.$node.hide).toHaveBeenCalled();
      });

      it('leaves widget shown if edit-mode is on', function() {
	spyOn(this.$node, 'hide');
	mock.config.edit_mode = true;
	$(document).trigger('config', mock.config);
	expect(this.$node.hide).not.toHaveBeenCalled();
      });
    });

    describe('on export', function() {
      it('does an export when triggered', function() {

	spyOn(window, 'open');
	this.component.trigger('data', mock.data);

	this.$node.trigger('submit');
	expect(window.open).toHaveBeenCalled();
	
	// Verify that the args are as expected...
	// For the URL, we just check that it has the right prefix, and
	// *some* of the expected text.

	var args = window.open.mostRecentCall.args;
	expect(args[1]).toEqual("Exported Finda Data");

	var url = args[0];
	expect(url).toMatch(/^data:text\/plain,/);
	expect(url).toMatch(/our-groups-programs/);
      });
    });

  });
});