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

// midikeyboard consumes a keymovements observable and produces an observable
// of midinotes i.e. {note: Integer, value: Integer}
export default function midikeyboard(keymovements) {
  let offset = 0
  let lowerKey = 'Z'.charCodeAt(0)
  let higherKey = 'X'.charCodeAt(0)

  // alter the offset with Z and X

  // BAD EXAMPLE DO NOT DO
  // 1 - this side effect "do" function won't fire until something actually
  //     subscribes to the observable
  // 2 - if we subscribe here, there is no way to dispose of the subscription
  //     later!
  keymovements.
    filter(function(movement) {
      return movement.direction === 'down' && movement.which === lowerKey
    }).
    do(function() {
      console.log('offset--')
      offset--
    }).subscribe()

  keymovements.
    filter(function(movement) {
      return movement.direction === 'down' && movement.which === higherKey
    }).
    do(function() {
      offset++
    })

  return keymovements.
    filter(function(movement) {
      return keymap.has(movement.which)
    }).
    map(function(movement) {
      if (movement.direction === 'down') {
        return {
          note: keymap.get(movement.which) + (offset * 12),
          value: 100
        }
      }
      return {
        note: keymap.get(movement.which) + (offset * 12),
        value: 0
      }
    })
}
