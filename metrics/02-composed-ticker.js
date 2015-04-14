'use strict'

let rx = require('rx')

/*

ticker starts after a random delay between (0,splay) and then
begins running the provided promise-returning fn at a regular
interval defined by period. At any time, there is a maximum of
1 running instance of fn. If a tick happens and a previous fn
is still running, then it will not be called.

...t........t........t........t   ticker
   .............p                 promise
                     ....p        promise
................v........v.....   out     


*/                
function ticker(splay, period, fn) {
  let delay = Math.random() * splay
  let inFlight = false

  return rx.Observable.timer(delay, period).
    do(function() {
      console.log('t')
    }).
    filter(function() {
      // don't care about the value, care about the timing
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

///////////////
// using ticker
var fn = function() {
  return new Promise(function(resolve) {
    var timeout = Math.random() * 2000 + 500
    setTimeout(function() {
      resolve(`finished after ${timeout}ms`)
    }, timeout)
  })
}

let sub = ticker(200, 1000, fn).subscribe(function(x) {
  console.log(x)
})

setTimeout(function() {
  sub.dispose()
}, 5000)