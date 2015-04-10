'use strict'

let rx = require('rx')
let _id = 0

let observable = rx.Observable.create(function(observer) {
  let id = _id++
  for (let i = 0; i < 10; i++) {
    observer.onNext(`${i} from ${id}`)  
  }

  return function() {
    // cleanup
  }
})

let subscription1 = observable.subscribe(function(x) {
  console.log(`observer 1 received ${x}`)
})

let subscription2 = observable.subscribe(function(x) {
  console.log(`observer 2 received ${x}`)
})