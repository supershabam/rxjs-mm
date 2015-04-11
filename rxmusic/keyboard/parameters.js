'use strict'

const knobs = {

}


// client connects
// client is told what type of knob it is and what text to display and current value
// server marks that knob as assigned until the client disconnects
// e.g. button, D4
// e.g. panner, Q
// everything the client sends is


// server is two types of websocket
// synth - send the current state of synth and then updates, multiple people can connect
// knob  - send config about what knob it is, and receive events back that change synth state and send update