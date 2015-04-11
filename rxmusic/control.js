'use strict'

let rx = require('rx')
let extend = require('util')._extend

module.exports = class Control {
  constructor(config) {
    this._config = config
    this._subject = new rx.BehaviorSubject(this._config.start)
  }

  config() {
    return this._config
  }

  observable() {
    let self = this
    return this._subject.map(function(value) {
      return {
        value: value,
        config: self._config
      }
    })
  }

  reset() {
    this.setValue(this._config.start)
  }

  setValue(value) {
    this._subject.onNext(value)
  }
}