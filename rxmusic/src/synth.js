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

let score = {} // global mutable we will abuse
let rescore = function() {
  Tone.Transport.clearTimelines()
  Tone.Note.parseScore(score)
}

// audio components
let synth = new Tone.PolySynth()
let crusher = new Tone.BitCrusher(4)
let feedbackDelay = new Tone.PingPongDelay({
  "delayTime" : "8n",
  "feedback" : 0.6,
  "wet" : 0.5
})
let kick = new Tone.Player("http://tonenotone.github.io/Tone.js/examples/audio/505/kick.mp3")
let snare = new Tone.Player("http://tonenotone.github.io/Tone.js/examples/audio/505/snare.mp3")
let hh = new Tone.Player("http://tonenotone.github.io/Tone.js/examples/audio/505/hh.mp3")



// wiring
synth.connect(crusher)
crusher.connect(feedbackDelay)
feedbackDelay.toMaster()
kick.connect(feedbackDelay)

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

function matrixToScoreline(m) {
  return m.reduce(function(memo, v, i) {
    if (v[0] !== 1) {
      return memo
    }
    let measure = ~~(i / 4)
    let note = i % 4
    return memo.concat([`${measure}:${note}`])
  }, [])
}

// kicker
ws.filter(function(msg) {
  return msg.config.type === 'matrix' && msg.config.name === 'kick'
}).subscribe(function(msg) {
  score.kick = matrixToScoreline(msg.value)
  rescore()
})

// only once tone is ready will we start up the websocket
Tone.Buffer.onload = function() {
  ws.connect() // start the observable now that Tone is ready
}





