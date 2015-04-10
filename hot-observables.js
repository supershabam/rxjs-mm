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

let hot = observable.publish()
// without connecting, the observer is never created
let connection = hot.connect()

let subscription1 = hot.subscribe(function(x) {
  console.log(`observer 1 received ${x}`)
})

let subscription2 = hot.subscribe(function(x) {
  console.log(`observer 2 received ${x}`)
})

setTimeout(function() {
  subscription1.dispose()
  subscription2.dispose()

  // observable continues going until connection is diposed
  // connection.dispose()
}, 5000)