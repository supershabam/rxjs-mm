import keymovements from './keymovements-hot'
import midikeyboard from './offsettingKeyboard'
import Tone from 'tone'

var synth = new Tone.PolySynth()
synth.toMaster()

let km = keymovements(document)
let kb = midikeyboard(km)

// f = (2 ^ (m−69)/12) (440 Hz)
function frequency(midinote) {
  return 440 * Math.pow(2, (midinote - 69) / 12)
}
kb.subscribe(function(note) {
  console.log(note)
})
kb.subscribe(function(note) {
  console.log(note)
  if (note.value === 0) {
    synth.triggerRelease(frequency(note.note))
  } else {
    synth.triggerAttack(frequency(note.note))
  }
})

//the transport won't start firing events until it's started
Tone.Transport.start()
