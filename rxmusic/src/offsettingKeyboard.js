import rx from 'rx'

// first keyboard key will have this midi value
// 60 = C4
let baseMIDINote = 60
// in-order keys
let keyboard = 'AWSEDFTGYHJIKOL'
// keymap turns a keyboard key into a midi note
let keymap = new Map(
  [].map.call(keyboard, function(c, i) {
    return [c.charCodeAt(0), baseMIDINote + i]
  })
)

let offsetDown = 'Z'.charCodeAt(0)
let offsetUp   = 'X'.charCodeAt(0)

// midikeyboard consumes a keymovements observable and produces an observable
// of midinotes i.e. {note: Integer, value: Integer}
export default function midikeyboard(keymovements) {
  return rx.Observable.create(function(observer) {
    let offset = 0
    let offsetUps = keymovements.
      filter(function(movement) {
        return movement.direction === 'down' && movement.which === offsetUp
      }).
      subscribe(function() {
        offset = Math.min(offset + 1, 3)
      })
    let offsetDowns = keymovements.
      filter(function(movement) {
        return movement.direction === 'down' && movement.which === offsetDown
      }).
      subscribe(function() {
        offset = Math.max(offset - 1, -3)
      })

    let notes = keymovements.
      filter(function(movement) {
        return keymap.has(movement.which) && movement.direction === 'down'
      }).
      flatMap(function(movement) {
        let note  = keymap.get(movement.which) + (offset * 12)
        let which = movement.which
        // return observable that is [downPress ... upPress] for a given key
        return rx.Observable.merge(
          rx.Observable.just({
            note: note,
            value: 100
          }),
          keymovements.
            filter(function(movement) {
              return movement.direction === 'up' && movement.which === which
            }).
            map(function() {
              return {
                note: note,
                value: 0
              }
            }).
            take(1) // make sure the observable ends
        )
      })

    notes.subscribe(observer)

    return function() {
      // cleanup code
      offsetUps.dispose()
      offsetDowns.dispose()
      notes.dispose()
    }
  })
}
