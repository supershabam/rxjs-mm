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
  return keymovements.
    filter(function(movement) {
      return keymap.has(movement.which)
    }).
    map(function(movement) {
      if (movement.direction === 'down') {
        return {
          note: keymap.get(movement.which),
          value: 100
        }
      }
      return {
        note: keymap.get(movement.which),
        value: 0
      }
    })
}
