$(function() {
  Demo = function() {
    var output = document.getElementById('output'),
        demo   = document.getElementById('demo'),
        yes   = document.getElementById('yes'),
        outpatient   = document.getElementById('outpatient'),
        inpatient   = document.getElementById('inpatient'),
        twelvestep   = document.getElementById('twelvestep'),
        detox   = document.getElementById('detox'),
        count  = 0;

    var log = function(msg, separate) {
      count = count + (separate ? 1 : 0);
      output.value = count + ": " + msg + "\n" + (separate ? "\n" : "") + output.value;
      demo.innerHTML = fsm.current;
    };

    var fsm = StateMachine.create({

      events: [
        { name: 'start', from: 'none',   to: 'needTreatment'  },
        { name: 'yes', from: 'needTreatment',   to: 'whatType'  },
        { name: 'outpatient', from: 'whatType',   to: 'outpatientTypes'  },
        { name: 'inpatient', from: 'whatType',   to: 'inpatientTypes'  },
      ],

      callbacks: {
        onbeforestart: function(event, from, to) { log("STARTING UP"); },
        onstart:       function(event, from, to) { log("READY");       },
        onchangestate: function(event, from, to) {
          $('#' + from).hide();
          $('#' + to).show();
          log("CHANGED STATE: " + from + " to " + to);
        }
      }
    });

    fsm.start();
    return fsm;
  }();

  // $('.question').hide()
});

