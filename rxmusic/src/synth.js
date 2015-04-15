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

// messages from websocket
let ws = rxdom.DOM.fromWebSocket(wsURL()).
  map(function(x) {
    try {
      return JSON.parse(x.data)
    } catch(err) {
      return {}
    }
  }).
  filter(function(msg) {
    return msg && msg.config
  }).
  publish()    // single hot observable

let score      = {} // global mutable we will abuse
let synthNotes = {}
function synthScoreline() {
  let scoreline = []
  Object.keys(synthNotes).forEach(function(note) {
    synthNotes[note].forEach(function(timing) {
      scoreline.push([timing, [note]])
    })
  })
  return scoreline
}
let rescore = function() {
  score.synth = synthScoreline()
  Tone.Transport.clearTimelines()
  Tone.Note.parseScore(score)
}
rescore()

let synth = new Tone.PolySynth(5, Tone.MonoSynth).setPreset("Pianoetta")
synth.volume.value = -30

let feedbackDelay = new Tone.PingPongDelay({
  "delayTime" : "8n",
  "feedback" : 0.6,
  "wet" : 0.5
})

let kick = new Tone.Player("http://tonenotone.github.io/Tone.js/examples/audio/505/kick.mp3")
let snare = new Tone.Player("http://tonenotone.github.io/Tone.js/examples/audio/505/snare.mp3")
let hh = new Tone.Player("http://tonenotone.github.io/Tone.js/examples/audio/505/hh.mp3")

// wiring
kick.connect(feedbackDelay)
snare.connect(feedbackDelay)
hh.connect(feedbackDelay)
synth.connect(feedbackDelay)
feedbackDelay.toMaster()

// wire scored components
Tone.Note.route("snare", function(time){
  snare.start(time)
})
Tone.Note.route("hh", function(time){
  hh.start(time)
})
Tone.Note.route("kick", function(time){
  kick.start(time)
})
Tone.Note.route("synth", function(time, value){
  var velocity = Math.random() * 0.5 + 0.4;
  for (var i = 0; i < value.length; i++) {
    synth.triggerAttackRelease(value[i], "16n", time, velocity);
  }
})

//setup the transport values
Tone.Transport.loopStart = 0;
Tone.Transport.loopEnd = "1:0";
Tone.Transport.loop = true;
Tone.Transport.bpm.value = 120;
Tone.Transport.swing = 0.2;

//the transport won't start firing events until it's started
Tone.Transport.start()

////////////////
// HANDLE EVENTS

// kicker
ws.filter(function(msg) {
  return msg.config.name === 'kick'
}).subscribe(function(msg) {
  score.kick = msg.value
  rescore()
})

// snare
ws.filter(function(msg) {
  return msg.config.name === 'snare'
}).subscribe(function(msg) {
  score.snare = msg.value
  rescore()
})

// hh
ws.filter(function(msg) {
  return msg.config.name === 'hh'
}).subscribe(function(msg) {
  score.hh = msg.value
  rescore()
})

// synth
ws.filter(function(msg) {
  return msg.config.name === 'synth'
}).subscribe(function(msg) {
  synthNotes[msg.config.note] = msg.value
  rescore()
})

// only once tone is ready will we start up the websocket
Tone.Buffer.onload = function() {
  ws.connect() // start the observable now that Tone is ready
}





