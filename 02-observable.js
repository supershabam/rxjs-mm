'use strict'

let rx = require('rx')

let observable = rx.Observable.create(function(observer) {
  setTimeout(function() {
    observer.onNext(1)
  }, 1000)

  setTimeout(function() {
    observer.onCompleted()
  }, 2000)

  return function() {
    // do cleanup if needed
    console.log('cleanup observable')
  }
})

let observer = rx.Observer.create(
  function(x) {
    console.log('onNext', x)
  },
  function(err) {
    console.log('onError', err)
  },
  function() {
    console.log('onCompleted')
  }
)

observable.subscribe(observer)

// rewrite observer to be inline on subscribe
// stop observing