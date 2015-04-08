import rx from 'rx'

function toMovement(direction) {
  return function(which) {
    return {
      which: which,
      direction: direction
    }
  }
}

export default function keymovements(el) {
  let active = new Set()

  let keydowns = rx.Observable.fromEvent(el, 'keydown').pluck('which')
  let keyups   = rx.Observable.fromEvent(el, 'keyup').pluck('which')
  // latched is once a keydown is triggered, it won't fire again until
  // manually unlatched (removing it from active)
  let latchedKeydowns = keydowns.
    filter(function(which) {
      return !active.has(which)
    }).
    do(function(which) {
      active.add(which)
    })
  let unlatchingKeyups = keyups.
    do(function(which) {
      active.delete(which)
    })

  return rx.Observable.merge(
    latchedKeydowns.map(toMovement('down')),
    unlatchingKeyups.map(toMovement('up'))
  )
}
