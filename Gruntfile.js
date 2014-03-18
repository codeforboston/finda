/*global module:false, process:false */
module.exports = function(grunt) {
  'use strict';
  // Project configuration.
  grunt.initConfig({
    clean: {
      dist: ["dist"]
    },
    copy: {
      dist: {
        files: [
          {src: ["data.geojson", "config.json", "*.md",
                 "styles/img/**", "styles/properties.css",
                 "lib/leaflet/images/**"],
           dest: "dist/"
          }
        ]
      }
    },
    cssmin: {
      dist: {
        files: {
          "dist/styles/style.min.css": ["styles/style.css"]
        }
      }
    },
    requirejs: {
      dist: {
        options: {
          baseUrl: "src",
          mainConfigFile: "src/script.js",
          preserveLicenseComments: true,
          wrap: false,
          name: "../node_modules/almond/almond",
          include: ["script"],
          insertRequire: ["script"],
          out: "dist/src/finda.min.js",
          optimize: "uglify2"
        }
      }
    },
    processhtml: {
      dist: {
        files: {
          "dist/index.html": ["index.html"]
        }
      }
    },

    jshint: {
      options: {
        jshintrc: ".jshintrc"
      },
      src: ["src/**/*.js"],
      all: ["src/**/*.js", "test/spec/**/*.js"]
    },

    karma: {
      options: {
        basePath: process.cwd(),
        singleRun: true,
        captureTimeout: 7000,
        autoWatch: true,
        logLevel: "ERROR",
        reporters: ["progress"],
        browsers: ["PhantomJS"],
        frameworks: ["jasmine"],

        plugins: [
          "karma-jasmine",
          "karma-phantomjs-launcher"
        ],

        // list of files / patterns to load in the browser
        files: [
          'lib/es5-shim.min.js',
          'lib/es5-sham.min.js',
          'lib/jquery-1.10.2.js',

          'test/lib/jasmine-jquery.js',
          'test/lib/jasmine-flight.js',

          // hack to load RequireJS after the shim libs
          'lib/require.js',
          'node_modules/karma-requirejs/lib/adapter.js',

          {pattern: 'src/**/*.js', included: false},
          {pattern: 'lib/**/*.js', included: false},
          {pattern: 'test/spec/**/*_spec.js', included: false},
          {pattern: 'test/mock.js', included: false},
          {pattern: 'lib/leaflet/images/*', included: false},
          'test/runner.js'
        ],

        // list of files to exclude
        exclude: [
          'src/script.js'
        ]
      },
      // This creates a server that will automatically run your tests when you
      // save a file and display results in the terminal.
      daemon: {
        options: {
          singleRun: false
        }
      },

      // This is useful for running the tests just once.
      run: {
        options: {
          singleRun: true
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-requirejs');
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-processhtml");
  grunt.loadNpmTasks("grunt-karma");

  // Default task.
  grunt.registerTask('default', ['clean', 'copy', 'cssmin', 'requirejs', 'processhtml']);
  grunt.registerTask('test', ['jshint:src', 'karma:run']);

};
