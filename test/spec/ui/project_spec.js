define(['test/mock', 'jquery'], function(mock, $) {
  'use strict';
  describeComponent('ui/project', function() {
    beforeEach(function() {
      setFixtures("<div id=\"name\" data-project=\"name\"/><div id=\"desc\" data-project=\"description\"/>");
      setupComponent();
    });

    describe('on config', function() {
      it('updates elements with data-project', function() {
        $(document).trigger('config', mock.config);
        expect($("#name").html()).toEqual(mock.config.project.name);
        expect($("#desc").html()).toEqual(mock.config.project.description);
      });
    });
  });
});
