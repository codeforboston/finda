# Get Help Lex [![Build Status](https://travis-ci.org/openlexington/gethelplex.svg)](https://travis-ci.org/openlexington/gethelplex) [![Stories in Ready](https://badge.waffle.io/openlexington/gethelplex.svg?label=ready&title=Ready)](http://waffle.io/openlexington/gethelplex)

## How to develop

    npm install
    npm install -g http-server
    npm start

Visit [localhost:8080](http://localhost:8080/) to see the app.

## I want to use this app for my data set.

Great! Head over to our [Getting Started wiki](https://github.com/codeforboston/finda/wiki/Getting-Started)

## I want to help build Finda

Great! See [Developing Finda](https://github.com/codeforboston/finda/wiki/Developing-Finda) on the wiki.

Look in the [waffle board](https://waffle.io/openlexington/finda) for priority issues.

## How to Test

You can run tests once by running: `npm test`

Keep test server running to speed up tests. Start test server:

    npm run test-server

Kick off a test run when the test server is running:

    npm run test-client

## Analytics and feedback

GetHelpLex uses Google Tag Manager to manage Google Analytics as described in the [Unified Analytics repository](https://github.com/laurenancona/unified-analytics).

GetHelpLex posts feedback to a Google Spreadsheet [as described here](https://mashe.hawksey.info/2014/07/google-sheets-as-a-database-insert-with-apps-script-using-postget-methods-with-ajax-example/).
As a backup, feedback is tracked using the [ga-feedback approach](https://github.com/luckyshot/ga-feedback) managed by Google Tag Manager [as described here](http://erikschwartz.net/2016-01-23-google-analytics-events-in-google-tag-manager/).

Feedback is emailed to addresses defined in the script attached to the [feedback spreadsheet](https://docs.google.com/spreadsheets/d/1lP-OsypwXFkH-S3F3Re34fBPSYgpr1ZXY6bRD85w3V8/edit).

## Add map coordinates for new facilities

![Geocode facilites](./get-help-lex-geocode.gif)
