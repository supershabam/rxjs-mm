'use strict'

let rx = require('rx')

module.exports = class Control {
  constructor(id, name, defaultValue) {
    this._id = id
    this._name = name
    this._defaultValue = defaultValue
    this._subject = new rx.BehaviorSubject(this._defaultValue)
  }

  observable() {
    let self = this
    return this._subject.asObservable().
      map(function(x) {
        return {
          id: self._id,
          name: self._name,
          value: x
        }
      })
  }

  reset() {
    this.setValue(this._defaultValue)
  }

  setValue(value) {
    this._subject.onNext(value)
  }
}