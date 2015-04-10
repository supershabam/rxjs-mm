'use strict'

let rx = require('rx')

let observer = rx.Observer.create(
  function(x) {
    console.log(`observed ${x}`)
  },
  function(err) {
    console.log(`error ${err}`)
  },
  function() {
    console.log('completed!')
  }
)

observer.onNext('hi')

observer.onError(new Error('an error!'))

// not sent because error terminates observing
observer.onCompleted()