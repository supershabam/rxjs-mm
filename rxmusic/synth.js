'use strict'

let rx = require('rx')
let Control = require('./control')

module.exports = class Synth {
  constructor() {
    this._controls = [
      new Control('c4', 'middle c', 0)
    ]
    this._available = new Set(this._controls)
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
