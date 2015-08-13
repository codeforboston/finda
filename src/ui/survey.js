define(function(require, exports, module) {
  'use strict';
  var flight = require('flight');
  var $ = require('jquery');
  var _ = require('lodash');
  var StateMachine = require('StateMachine');
  var Handlebars = require('handlebars');
  var states = [{
      name: "needTreatment",
      title: "Do you need treatment?",
      options: [{
          event: "needTreatmentYes",
          label: "Yes"
        },{
          event: "needTreatmentNotSure",
          label: "I'm not sure"
        }]
      },{
      name: "whatType",
      title: "What type?",
      options: [{
          label: "oupatient_offered",
          facetName: "oupatient_offered",
        },{
          label: "residential_offered",
          facetName: "residential_offered",
        },{
          event: "oupatient_offered",
          label: "next",
        }]
      },{
      name: "whatTypeOutpatient",
      title: "whatTypeOutpatient?",
      options: [{
          label: "outpatient_intensive",
          facetName: "outpatient_intensive"
        },{
          label: "outpatient_services",
          facetName: "outpatient_services"
        },{
          label: "outpatient_twelvestep",
          facetName: "outpatient_twelvestep"
        },{
          event: "nextResidential",
          label: "next"
        }]
      },{
      name: "whatTypeResidential",
      title: "whatTypeResidential?",
      options: [{
          label: "residential_detox_offered",
          facetName: "residential_detox_offered"
        },{
          event: "nextGender",
          label: "next"
        }
      ]
      },{
      name: "whatTypeGender",
      title: "whatTypeGender?",
      options: [{
          label: "gender_male",
          facetName: "gender_male"
        },{
          label: "gender_female",
          facetName: "gender_female"
        },{
          event: "nextInsurance",
          label: "next"
        }
      ]
      },{
      name: "whatTypeInsurance",
      title: "whatTypeInsurance?",
      options: [{
          label: "gender_male",
          facetName: "gender_male"
        },{
          label: "gender_female",
          facetName: "gender_female"
        },{
          event: "nextInsurance",
          label: "next"
        }
      ]
      },

      ];
  var statesByName = {};
  _.each(states, function(state) {
    statesByName[state.name] = state;
  });
  var templates = {
    state: Handlebars.compile('<div class="question-x" id="{{stateInfo.name}}"><h4>{{stateInfo.title}}</h4>{{{options}}}</div>'),
    // options: Handlebars.compile('<ul class="list-unstyled">{{#each options}}<li>foo</li>{{/each}}</ul>')
    options: Handlebars.compile('<ul class="list-unstyled">{{#each options}}<li><button type="button" data-state-event="{{event}}" data-facet-name="{{facetName}}" class="btn {{#if facetValue}}btn-primary{{else}}btn-default{{/if}}">{{label}}</button></li>{{/each}}</ul>')
  };

  module.exports = flight.component(function() {

    this.after('initialize', function() {
      $(document).trigger('uiHideResults', {});
      // this.$node.show();
      var _this = this;
      this.Demo = (function() {
        // var demo   = document.getElementById('demo'),
        //     count  = 0;

        var fsm = StateMachine.create({

          events: [
            { name: 'start', from: 'none',   to: 'needTreatment'  },
            { name: 'needTreatmentYes', from: 'needTreatment',   to: 'whatType'  },
            { name: 'needTreatmentNotSure', from: 'needTreatment',   to: 'StateNeedTreatmentNotSure'  },
            { name: 'oupatient_offered', from: 'whatType',   to: 'whatTypeOutpatient'  },
            { name: 'residential_offered', from: 'whatType',   to: 'whatTypeResidential'  },
            { name: 'outpatient_services', from: 'whatTypeOutpatient', to: 'whatTypeOutpatient' },
            { name: 'whatTypeRevisit', from: 'whatTypeOutpatient',   to: 'whatType' },
            { name: 'next', from: 'whatTypeOutpatient',   to: 'StateResults' },
            { name: 'nextResidential', from: 'whatTypeOutpatient',   to: 'whatTypeResidential' },
            { name: 'nextGender', from: 'whatTypeResidential',   to: 'whatTypeGender' },
            { name: 'nextInsurance', from: 'whatTypeGender',   to: 'whatTypeInsurance' },
            // { name: 'genderMale', from: 'whatGender',   to: 'inpatientTypes'  }
          ],

          callbacks: {
            // onbeforestart: function() { console.log("STARTING UP"); },
            // onstart:       function() { console.log("READY");       },
            onneedTreatmentNotSure: function() {
              var state = _this.$node.find('.state-machine-state[data-state=stateNeedTreatmentNotSure]');
              state.show();
            },
            onbeforeoupatient_offered: function () {
              // figure out if skip outpatient
              var btn = _this.$node.find('.btn[data-facet=oupatient_offered]');
              console.log(btn);
            },
            // onwhatTypeBoth: function() {
            //   $(document).trigger('uiFacetChangeRequest', {
            //     name: 'oupatient_offered',
            //   });
            //   $(document).trigger('uiFacetChangeRequest', {
            //     name: 'residential_offered',
            //   });
            //   $(document).trigger('uiShowResults', {});
            // },
            onnextInsurance: function() {
              $(document).trigger('uiShowResults', {});
            },
            onchangestate: function(event, from, to) {
              $('#active-state').html(
                templates.state({
                  stateInfo: statesByName[to],
                  options: templates.options(statesByName[to])
                })
              ).show();
              console.log("CHANGED STATE: " + from + " to " + to);
            }
          }
        });

        return fsm;
      }());

      // this.$node.html('<h4>foo</h4>');
      window.setTimeout(function() {
        this.$node.show();
        this.Demo.start();
      }.bind(this), 0);

      this.on('click', function(ev) {
        var stateEvent = ev.target.dataset.stateEvent;
        var facetName = ev.target.dataset.facetName;

        if (facetName) {
          // this.Demo[facetName]();
          $(document).trigger('uiFacetChangeRequest', {
            name: facetName
          });
          $(ev.target).toggleClass('btn-primary');
          // console.log(this.Demo.current);
          // $(document).trigger('uiShowResults', {});
        }
        if (stateEvent) {
          if (this.Demo[stateEvent]) {
            this.Demo[stateEvent]();
          } else {
            console.error('not a valid state action ' + stateEvent);
          }
        }
      });
    });
  });
});
