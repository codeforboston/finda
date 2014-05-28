#!/usr/bin/env node
'use strict';
var path = require('path');
var fs = require('fs');
var glob = require('glob');
var mkdirp = require('mkdirp');
var input = [
  'index.html',
  'data.geojson',
  'config.json',
  'styles/properties.css',
  'img/logo.png'
];
var inGlobs = [
  '*.md',
  'lib/leaflet/images/marker-*'
];
var outDir = 'dist';

function move(infile, outpath) {
  fs.createReadStream(infile).pipe(fs.createWriteStream(path.join(outpath, infile)));
}

function moveGlob (inGlob, outpath) {
  glob(inGlob, function (err, files) {
    if (err) {
      console.log(err);
    }
    files.forEach(function (file) {
      move(file, outpath);
    });
  });
}

mkdirp.sync(path.join(outDir,'lib/leaflet/images'));
mkdirp.sync(path.join(outDir,'styles'));
mkdirp.sync(path.join(outDir,'img'));
input.forEach(function (file) {
  move(file, outDir);
});
inGlobs.forEach(function (file) {
  moveGlob(file, outDir);
});
