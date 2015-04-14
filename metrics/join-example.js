'use strict'

let rx = require('rx')
let ticker = require('./ticker')

let makeFn = function(config) {
  return function() {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        reject(new Error(config.name))
      }, 250)
    })
  }
}

let s1 = ticker(500, 1000, makeFn({
  name: 'source 1'
}))

let s2 = ticker(500, 1000, makeFn({
  name: 'source 2'
}))

let combined = rx.Observable.merge(s1, s2)

let sub = combined.subscribe(
  function(x) {
    console.log(`result: ${x}`)
  },
  function(err) {
    console.log(err)
  })

setTimeout(function() {
  sub.dispose()
}, 5000)

