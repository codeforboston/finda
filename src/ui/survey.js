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
          event: "oupatient_offered",
          label: "oupatient_offered",
          facetName: "oupatient_offered",
        },{
          event: "outpatient_services",
          label: "outpatient_services"
        }]
      },
      ];
  var statesByName = {};
  _.each(states, function(state) {
    statesByName[state.name] = state;
  });
  var templates = {
    state: Handlebars.compile('<div class="question-x" id="{{stateInfo.name}}"><h4>{{stateInfo.title}}</h4>{{{options}}}</div>'),
    // options: Handlebars.compile('<ul class="list-unstyled">{{#each options}}<li>foo</li>{{/each}}</ul>')
    options: Handlebars.compile('<ul class="list-unstyled">{{#each options}}<li><button type="button" data-state-action="{{event}}" data-facet-name="{{facetName}}" class="btn">{{label}}</button></li>{{/each}}</ul>')
  };

  module.exports = flight.component(function() {
    /*
      question attributes
       - name (questionId)
       - options
         - radio or checkbox
         - facetName or stateName
    this.questions = {
      title: 'Do you need treatment?',
    };
    */

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
            { name: 'outpatient_intensive', from: 'whatTypeOutpatient',   to: 'gender' }
            // { name: 'genderMale', from: 'whatGender',   to: 'inpatientTypes'  }
          ],

          callbacks: {
            onbeforestart: function() { console.log("STARTING UP"); },
            onstart:       function() { console.log("READY");       },
            onneedTreatmentNotSure: function() {
              var state = _this.$node.find('.state-machine-state[data-state=stateNeedTreatmentNotSure]');
              state.show();
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
        var stateAction = ev.target.dataset.stateAction;
        var facetName = ev.target.dataset.facetName;

        if (facetName) {
          this.Demo[facetName]();
          $(document).trigger('uiFacetChangeRequest', {
            name: facetName
          });
          $(document).trigger('uiShowResults', {});
        } else if (stateAction) {
          this.Demo[stateAction]();
        }
      });
    });
  });
});
