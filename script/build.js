({
  baseUrl: '../src',
  mainConfigFile: '../src/script.js',
  preserveLicenseComments: true,
  wrap: false,
  name: '../node_modules/almond/almond',
  include:'script',
  insertRequire:['script'],
  out: '../dist/src/script.js',
  optimize: 'uglify2'
})
