'use strict'

let rx = require('rx')

function ticker(splay, period, fn) {
  let delay = Math.random() * splay
  let inFlight = false

  return rx.Observable.timer(delay, period).
    filter(function() {
      return !inFlight
    }).
    do(function() {
      inFlight = true
    }).
    concatMap(function() {
      return rx.Observable.fromPromise(fn())
    }).
    do(function() {
      inFlight = false
    })
}

// returns a fn that we can pass to ticker which resolves with an
// array of generated metrics after 100ms when called.
let makeMetricFn = function(base) {
  return function() {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve([
          {key: `${base}.cpu`, value: Math.random(), at: new Date()},
          {key: `${base}.disk`, value: Math.random(), at: new Date()},
          {key: `${base}.network`, value: Math.random(), at: new Date()},
          {key: `${base}.memory`, value: Math.random(), at: new Date()}
        ])
      }, 100)
    })
  }
}

let metricTickers = []
for (let i = 0; i < 100; ++i) {
  metricTickers.push(ticker(10e3, 1e3, makeMetricFn(`metricTicker${i}`)))
}

let output = rx.Observable.merge(metricTickers)
  //.
  // flatMap(function(bundle) {
  //   return rx.Observable.from(bundle)
  // }).
  // bufferWithTimeOrCount(15e3, 250)

output.subscribe(function(x) {
  console.log(x)
})
