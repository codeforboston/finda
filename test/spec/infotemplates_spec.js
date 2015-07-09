define(
  ['infotemplates', 'jquery', 'test/mock'],
  function(templates, $, mock) {
    'use strict';
    describe('infotemplates', function() {
      var config = mock.config.properties,
          feature = mock.data.features[0].properties;
      describe('#popup', function() {
        var rendered = templates.popup(config, feature),
            $rendered = $(rendered);
        it('urls are rendered as links', function () {
          var link = $rendered.find('.feature-web_url a');
          expect(link.length).toEqual(1);
          expect(link.attr('href')).toEqual(feature.web_url);
          expect(link.text()).toEqual(config[3].title);
        });
        it('directions are rendered as links to Google Maps', function() {
          var $directions = $rendered.find('.feature-Address a');
          expect($directions.text()).toEqual(config[2].title);
          expect($directions.attr('href')).toMatch('maps.google.com');
          expect($directions.attr('href')).toMatch('q=' + encodeURIComponent(
            feature.Address.replace('\n', ' ')));
        });
        it('images are rendered as images', function() {
          var image = $rendered.find('.feature-image img');
          expect(image.attr('src')).toEqual(
            feature.image);
        });
        it('titles are rendered as h4s', function () {
          var title = $rendered.find('.feature-contact_names h4');
          expect(title.length).toEqual(1);
          expect(title.text()).toEqual(config[4].title);
        });
        it('lists are rendered as unordered lists', function() {
          var services_offered = $rendered.find(
            '.feature-services_offered ul');
          expect(services_offered.length).toEqual(1);
          expect(services_offered.find('li').length).toEqual(2);
        });
        it('plain text is rendered as-is, with \n -> <br>', function () {
          var Address = $rendered.find('.feature-Address');
          expect(Address.length).toEqual(2);
          expect(Address.html()).toEqual(
            feature.Address.replace(/\n/g, '<br>'));
        });
        it('empty attributes are not rendered', function() {
          var additional_notes = $rendered.find('.feature-additional_notes');
          expect(additional_notes.length).toEqual(0);
        });
      });
    });
  });
