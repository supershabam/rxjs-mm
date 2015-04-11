import Tone from 'tone'
import rxdom from 'rx-dom'
import rx from 'rx'

function wsURL() {
  let scheme = 'ws'
  if (window.location.protocol === 'https:') {
    scheme = 'wss'
  }
  return `${scheme}://${window.location.host}/synth`
}

// f = (2 ^ (m−69)/12) (440 Hz)
function frequency(midinote) {
  return 440 * Math.pow(2, (midinote - 69) / 12)
}


// audio components
let synth = new Tone.PolySynth()
let feedbackDelay = new Tone.PingPongDelay({
  "delayTime" : "8n",
  "feedback" : 0.6,
  "wet" : 0.5
})

// wiring
synth.connect(feedbackDelay)
feedbackDelay.toMaster()

let ws = rxdom.DOM.fromWebSocket(wsURL())
let p = ws.publish() // single hot observable

let msgs = p.map(function(m) {
  return JSON.parse(m.data)
})

// handle notes
msgs.filter(function(msg) {
  return msg && msg.config && msg.config.type === 'note'
}).subscribe(function(msg) {
  if (msg.value === 0) {
    synth.triggerRelease(frequency(msg.config.note))
  } else {
    synth.triggerAttack(frequency(msg.config.note))
  }
})

let connection = p.connect() // create the observable

//the transport won't start firing events until it's started
Tone.Transport.start()
