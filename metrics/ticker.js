'use strict'

let rx = require('rx')

// ticker will wait a random time between [0,splay) before calling fn
// which is a promise-returning function. Thereafter, fn will be called
// at a regular period.
// There will be a maximum of 1 fn call in-flight at a time. If a fn call
// is scheduled to execute while a previous call is already in-flight, the
// call is skipped.
// This returns an observable sequence of the values returned by fn.
module.exports = function ticker(splay, period, fn) {
  let delay = Math.random() * splay
  let inFlight = false

  return rx.Observable.timer(delay, period).
    do(function() {
      console.log('tick')
    }).
    filter(function() {
      return !inFlight
    }).
    do(function() {
      inFlight = true
    }).
    flatMap(function() {
      console.log('calling fn')
      return rx.Observable.fromPromise(fn()).
        do(function() {
          inFlight = false
        })
    })
}