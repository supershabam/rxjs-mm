'use strict'

let rx = require('rx')

let observable = rx.Observable.create(function(observer) {
  console.log('observable created')

  observer.onNext('hi')
  // comment out terminal functions and observer won't be destroyed
  observer.onError(new Error('an error!'))
  observer.onCompleted()

  return function() {
    console.log('observable destroyed')
  }
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

setTimeout(function() {
  observable.subscribe(observer)  
}, 2000)


