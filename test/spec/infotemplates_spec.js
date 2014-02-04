'use strict';
define(
  ['infotemplates', 'jquery', 'test/mock'],
  function(templates, $, mock) {
    describe('infotemplates', function() {
      var config = mock.config.properties,
          feature = mock.data.features[0].properties;
      describe('#popup', function() {
        var rendered = templates.popup(config, feature),
            $rendered = $(rendered);
        it('urls are rendered as links', function () {
          var link = $rendered.find('#web_url a');
          expect(link.length).toEqual(1);
          expect(link.attr('href')).toEqual(feature.web_url);
          expect(link.text()).toEqual(config.web_url.title);
        });
        it('titles are rendered as h4s', function () {
          var title = $rendered.find('#contact_names h4');
          expect(title.length).toEqual(1);
          expect(title.text()).toEqual(config.contact_names.title);
        });
        it('lists are rendered as unordered lists', function() {
          var services_offered = $rendered.find('#services_offered ul');
          expect(services_offered.length).toEqual(1);
          expect(services_offered.find('li').length).toEqual(2);
        });
        it('plain text is rendered as-is, with \n -> <br>', function () {
          var address = $rendered.find('#address');
          expect(address.length).toEqual(1);
          expect(address.html()).toEqual(
            feature.address.replace(/\n/g, '<br>'));
        });
      });
    });
  });
