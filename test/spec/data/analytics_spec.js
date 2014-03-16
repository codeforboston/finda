define(function() {
  'use strict';
  describeComponent('data/analytics', function() {
    var config;
    beforeEach(function() {
      config = {analytics: {}};
      setupComponent();
      spyOn(this.component, 'track');
      spyOn(this.component, 'trackAll');
    });

    afterEach(function() {
      window.ga = undefined;
    });

    describe('track', function() {
      beforeEach(function() {
        this.component.track.andCallThrough();
      });
      it('calls window.ga if present', function() {
        window.ga = function() {};
        spyOn(window, 'ga');
        this.component.track(1, 2, 3);
        expect(window.ga).toHaveBeenCalledWith(1, 2, 3);
      });
      it('creates ga object if not present', function() {
        window.ga = undefined;
        this.component.track(1, 2, 3);
        expect(window.ga).toEqual({q: [[1, 2, 3]], l: jasmine.any(Number)});
      });
      it('uses an existing ga object', function() {
        window.ga = {q: []};
        this.component.track(1, 2, 3);
        expect(window.ga).toEqual({q: [[1, 2, 3]]});
      });
    });

    it("enabled: false sends no events", function() {
      this.component.trigger('config', config);
      expect(this.component.track).not.toHaveBeenCalled();
    });

    describe("enabled: true", function() {
      beforeEach(function() {
        config.analytics.enabled = true;
      });
      it('configures the CodeForBoston tracker (private: false)', function() {
        this.component.trigger('config', config);
        expect(this.component.track).toHaveBeenCalledWith(
          'create', this.component.attr.codeForBostonTracker, 'localhost',
          {name: 'cfb'});
      });
      it('does not configure the CodeForBoston tracker (private: true)', function() {
        config.analytics['private'] = true;
        this.component.trigger('config', config);
        expect(this.component.track).not.toHaveBeenCalled();
      });
      it('uses a provided hostname', function() {
        config.analytics.hostname = 'auto';
        this.component.trigger('config', config);
        expect(this.component.track).toHaveBeenCalledWith(
          'create', this.component.attr.codeForBostonTracker, 'auto',
          {name: 'cfb'});
      });
      it('also configures a provided tracker', function() {
        config.analytics.google_tracker = 'TRACKER';
        this.component.trigger('config', config);
        expect(this.component.track).toHaveBeenCalledWith(
          'create', this.component.attr.codeForBostonTracker, 'localhost',
          {name: 'cfb'});
        expect(this.component.track).toHaveBeenCalledWith(
          'create', 'TRACKER', 'localhost',
          {name: 'user'});
      });
      it('trackAll send the message to each configured tracker', function () {
        config.analytics.google_tracker = 'tracker';
        this.component.trackAll.andCallThrough();
        this.component.trigger('config', config);
        expect(this.component.track).toHaveBeenCalledWith(
          'cfb.send', 'pageview');
        expect(this.component.track).toHaveBeenCalledWith(
          'user.send', 'pageview');
      });
      it('sends a pageview event', function() {
        this.component.trigger('config', config);
        expect(this.component.trackAll).toHaveBeenCalledWith(
          'send', 'pageview');
      });

      describe('events (detail: false)', function() {
        beforeEach(function() {
          this.component.trigger('config', config);
        });
        it('sends a click event on facet selection', function() {
          this.component.trigger('uiFilterFacet', {facet: 'data'});
          expect(this.component.trackAll).toHaveBeenCalledWith(
            'send', 'event', 'click', 'facets', null);
        });
        it('sends a click event on feature selection', function() {
          this.component.trigger('selectFeature', {geometry: {
            coordinates: [-1, +2]}});
          expect(this.component.trackAll).toHaveBeenCalledWith(
            'send', 'event', 'click', 'feature', null);
        });
        it('sends a click event on search', function() {
          this.component.trigger('uiSearch', {search: 'data'});
          expect(this.component.trackAll).toHaveBeenCalledWith(
            'send', 'event', 'click', 'search', null);
        });
      });

      describe('events (detail: true)', function() {
        beforeEach(function() {
          config.analytics.detail_enabled = true;
          this.component.trigger('config', config);
        });
        it('sends a click event on facet selection', function() {
          this.component.trigger('uiFilterFacet', {facet: 'data'});
          expect(this.component.trackAll).toHaveBeenCalledWith(
            'send', 'event', 'click', 'facets',
            JSON.stringify({facet: 'data'}));
        });
        it('sends a click event on feature selection', function() {
          this.component.trigger('selectFeature', {geometry: {
            coordinates: [-1, +2]}});
          expect(this.component.trackAll).toHaveBeenCalledWith(
            'send', 'event', 'click', 'feature', '-1,2');
        });
        it('sends a click event on search', function() {
          this.component.trigger('uiSearch', {query: 'data'});
          expect(this.component.trackAll).toHaveBeenCalledWith(
            'send', 'event', 'click', 'search', 'data');
        });
      });
    });
  });
});
