define(['test/mock', 'jquery'], function(mock, $) {

  'use strict';

  describeComponent('ui/export', function() {
    beforeEach(function() {
      setupComponent('<form id="export">foo:<input/></form>');
      spyOnEvent(document,'requestEditedData');
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
      
      it('requests export data on form submittal', function() {
        this.$node.trigger('click');
        expect('requestEditedData').toHaveBeenTriggeredOnAndWith(
          document,'editedDataForSave');
      });

      it('does an export when triggered', function() {

        // Note that we are *not* mocking out the request/response
        // protocol that gets the request data from the edit-state
        // component; setting up that test environment would be...
        // complex.

        spyOn(window, 'open');
        this.component.trigger('editedDataForSave', mock.data);
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