'use strict'

let rx = require('rx')

let observable = rx.Observable.create(function(observer) {
  observer.onNext('hi')
  observer.onError(new Error('an error!'))
  observer.onCompleted()
})

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

observable.subscribe(observer)

