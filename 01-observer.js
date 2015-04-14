'use strict'

let rx = require('rx')

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

observer.onNext(1)
observer.onNext(2)
observer.onCompleted()
observer.onError(new Error('oops')) // won't be called

// re-order onCompleted and onError
// try calling onCompleted multiple times