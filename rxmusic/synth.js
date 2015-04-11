'use strict'

let rx = require('rx')
let Control = require('./control')

class Synth {
  constructor() {
    this._controls = [
      new Control('c4', 'middle c', 0),
      new Control('c3', 'middle c', 2)
    ]
  }

  acquire() {
    return this._controls[0]
  }

  release(control) {
    control.reset()
  }

  observable() {
    let self = this
    return rx.Observable.create(function(observer) {
      // subscribe observer to all the controls
      let merged = rx.Observable.merge(
        self._controls.map(function(control) {
          return control.observable()
        })
      )
      let sub = merged.subscribe(observer)

      return function() {
        // cleanup
        sub.dispose()
      }
    })
  }
}

let s = new Synth()

let d = s.observable().subscribe(function(x) {
  console.log(x)
})

d.dispose()

let c = s.acquire()
c.setValue(48)
s.release(c)

