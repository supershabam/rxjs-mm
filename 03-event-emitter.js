'use strict'

let rx = require('rx')
let events = require('events')

let ee = new events.EventEmitter()

let onNext = function(x) {
  console.log('onNext', x)
}
let onError = function(err) {
  console.log('onError', err)
}
let onCompleted = function() {
  console.log('onCompleted')
}

ee.on('next', onNext)
ee.once('error', onError) // unsubscribes itself once error hits, but next and complete could still fire...
ee.once('complete', onCompleted)

ee.emit('next', 1)
ee.emit('next', 2)
ee.emit('complete')
ee.emit('error', new Error('oops'))

// add second listener to next
// remove listeners on complete or error