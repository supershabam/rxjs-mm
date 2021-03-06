'use strict'

let rx = require('rx')
let Control = require('./control')

module.exports = class Synth {
  constructor() {
    this._controls = [
      new Control({
        type: 'matrix',
        name: 'synth',
        note: 'G3',
        row: 1,
        col: 16,
        start: []
      }),
      new Control({
        type: 'matrix',
        name: 'synth',
        note: 'A4',
        row: 1,
        col: 16,
        start: []
      }),
      new Control({
        type: 'matrix',
        name: 'synth',
        note: 'C4',
        row: 1,
        col: 16,
        start: []
      }),
      new Control({
        type: 'matrix',
        name: 'synth',
        note: 'E4',
        row: 1,
        col: 16,
        start: []
      }),
      new Control({
        type: 'matrix',
        name: 'synth',
        note: 'G4',
        row: 1,
        col: 16,
        start: []
      }),
      new Control({
        type: 'matrix',
        name: 'synth',
        note: 'A5',
        row: 1,
        col: 16,
        start: []
      }),
      new Control({
        type: 'matrix',
        name: 'kick',
        row: 1,
        col: 4,
        start: []
      }),
      new Control({
        type: 'matrix',
        name: 'snare',
        row: 1,
        col: 4,
        start: []
      }),
      new Control({
        type: 'matrix',
        name: 'hh',
        row: 1,
        col: 4,
        start: []
      })
    ]
    // quick hack to make it so ony one person can have a control
    this._available = []
    let self = this
    this._controls.forEach(function(control) {
      self._available.push(control)
    })
  }

  acquire() {
    if (!this._available.length) {
      return null
    }
    let index = ~~(Math.random() * this._available.length)
    return this._available.splice(index, 1)[0]
  }

  release(control) {
    control.reset()
    this._available.push(control)
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
