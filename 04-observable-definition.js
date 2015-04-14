'use strict'

// if an observable falls in the woods and there's no observer
// to hear it, does it make a sound?

let rx = require('rx')

let _id = 1

let observable = rx.Observable.create(function(observer) {
  let myId = _id++
  observer.onNext(`observable(${myId}): 1`)
  setTimeout(function() {
    observer.onNext(`observable(${myId}): 2`)
    observer.onCompleted()
  }, 1000)
})

observable.subscribe(
  function(x) {
    console.log('observer1', x)
  }
)

observable.subscribe(
  function(x) {
    console.log('observer2', x)
  }
)

// stop only one observer mid-way
// turn observable into published observable

// observable.publish()
// observable.publish().refCount() (second subscriber misses first value)
// refCount unsubscribe all, then re-subscribe (new observable)
// let connection = observable.connect()
// connection.dispose()