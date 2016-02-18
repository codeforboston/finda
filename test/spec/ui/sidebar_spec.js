define(['test/mock', 'jquery', 'lodash'], function(mock, $, _) {
  'use strict';
  describeComponent('ui/sidebar', function() {
    beforeEach(function() {
      setupComponent();
    });

    describe('on config', function() {
      it('updates sets correct # of sidebar items', function() {
        $(document).trigger('config', mock.config);
        expect(this.$node.hasClass('sidebar-items-2')).toEqual(true);

        var noListAttrMock = _.clone(mock.config);
        delete noListAttrMock.list
        $(document).trigger('config', noListAttrMock);
        expect(this.$node.hasClass('sidebar-items-1')).toEqual(true);
      });

      it('only shows tabs if there is more than 1 item', function(){
        var noListAttrMock = _.clone(mock.config);
        delete noListAttrMock.list
        $(document).trigger('config', noListAttrMock);
        expect(this.$node.hasClass('no-tabs')).toEqual(true);
      });
    });

  });
});
