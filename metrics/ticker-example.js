'use strict'

let ticker = require('./ticker')

var fn = function() {
  return new Promise(function(resolve) {
    var timeout = Math.random() * 2000 + 500
    console.log(`running for ${timeout}`)
    setTimeout(function() {
      resolve('done')
    }, timeout)
  })
}

ticker(200, 1000, fn).subscribe(function(x) {
  console.log(`result: ${x}`)
})