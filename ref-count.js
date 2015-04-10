'use strict'

let rx = require('rx')
let _id = 0

let observable = rx.Observable.create(function(observer) {
  console.log('created observable')
  let interval = rx.Observable.interval(1000)
  let id = _id++

  let count = 0
  let intervalSub = interval.subscribe(
    function() {
      console.log('interval')
      observer.onNext(`${count} from ${id}`)
      count++
    }
  )

  return function() {
    // cleanup
    intervalSub.dispose()
  }
})

// obs created on first subscription, and ended on last unsubscribe
let obs = observable.publish().refCount()

let subscription1 = obs.subscribe(function(x) {
  console.log(`observer 1 received ${x}`)
})

let subscription2 = obs.subscribe(function(x) {
  console.log(`observer 2 received ${x}`)
})

setTimeout(function() {
  subscription1.dispose()
  subscription2.dispose()
}, 5000)