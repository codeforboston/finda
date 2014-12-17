// Karma configuration
// Generated on Sat Jan 25 2014 18:43:51 GMT-0500 (EST)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'lib/es5-shim.min.js',
      'lib/es5-sham.min.js',
      'lib/jquery-1.11.1.min.js',

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
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
