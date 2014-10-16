define(['test/mock', 'jquery'], function(mock, $) {
  'use strict';
  describeComponent('data/edit_state', function() {
    beforeEach(function() {
      setupComponent();
    });

    describe('on data load', function() {

      it('records the data', function() {
	this.component.trigger('data', mock.data);
	expect(this.component.data).toEqual(mock.data);
      });

      it('sends edited data back to whoever asks', function() {
	spyOn(this.$node, 'trigger');
	this.component.trigger('data', 'grubbitz');
	this.component.trigger('requestEditedData', 'callbackEvent')
	expect(this.$node.trigger).toHaveBeenCalledWith('callbackEvent',
							mock.data);
      });
    });
  });
});