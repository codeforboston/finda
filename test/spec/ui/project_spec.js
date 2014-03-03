define(['test/mock', 'jquery'], function(mock, $) {
  'use strict';
  describeComponent('ui/project', function() {
    beforeEach(function() {
      setupComponent();
    });

    describe('on config', function() {
      it('updates elements with data-project', function() {
        setFixtures("<div id=\"name\" data-project=\"name\"/><div id=\"desc\" data-project=\"description\"/>");
        $(document).trigger('config', mock.config);
        expect($("#name").html()).toEqual(mock.config.project.name);
        expect($("#desc").html()).toEqual(mock.config.project.description);
      });

      it('updates content of meta fields', function() {
        setFixtures("<meta name=\"description\" content=\"\">");
        $(document).trigger('config', mock.config);
        expect($("meta[name=description]").attr('content')).toEqual(
          $("<div/>").html(mock.config.project.description).text());
      });
    });
  });
});
