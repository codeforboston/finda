define(function(require) {
  'use strict';
  var $ = require('jquery');

  var chunkLength = 50,
      tickLength = 25;

  function nextTick(f) {
    window.setTimeout(f, tickLength);
  }

  return function timedWithObject(array, handler, object, newThis) {
    // Given an array and a handler function, calls the handler function with
    // each element of the array, along with arbitrary object, returning a
    // promise.  The value returned from the previous call to the handler is
    // used as the object for the next call, and the final object is used to
    // resolve the returned promise. If processing takes longer than 50ms,
    // further chunks will be done in other interations of the event loop to
    // avoid blocking the UI thread. Based on Nicholas C. Zakas'
    // timedChunk().
    var deferred = $.Deferred();
    if (array.length === 0) {
      deferred.resolve(object);
      return deferred.promise();
    }

    array = array.slice();

    nextTick(function internalLoop() {
      var start = +new Date(),
          offset;

      do {
        object = handler.call(newThis, array.shift(), object);
        offset = +new Date() - start;
      } while (array.length > 0 && offset < chunkLength);

      if (array.length > 0) {
        nextTick(internalLoop);
      } else {
        deferred.resolve(object);
      }

    });

    return deferred.promise();
  };
});
