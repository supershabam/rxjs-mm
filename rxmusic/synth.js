'use strict'

let rx = require('rx')
let Control = require('./control')

module.exports = class Synth {
  constructor() {
    this._controls = [
      // new Control({
      //   type: 'note',
      //   start: 0,
      //   note: 60
      // }),
      // new Control({
      //   type: 'note',
      //   start: 0,
      //   note: 50
      // }),
      // new Control({
      //   type: 'crusher',
      //   start: 8
      // }),
      new Control({
        type: 'matrix',
        name: 'kick',
        row: 1,
        col: 4,
        start: [[1],[0],[0],[0]]
      })
    ]
    this._available = new Set(this._controls)
  }

  acquire() {
    return this._controls[~~(Math.random() * this._controls.length)]
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
