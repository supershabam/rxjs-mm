'use strict'

let http    = require('http')
let nstatic = require('node-static')
let rx      = require('rx')

let WebSocketServer = require('websocket').server
let Synth = require('./synth')

let synth = new Synth()

let file = new nstatic.Server('./public')
let server = http.createServer(function(req, resp) {
  req.addListener('end', function () {
    file.serve(req, resp)
  }).resume()
})

synth.observable().subscribe(function(x) {
  console.log(x)
})

let wss = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
})

function handleSynthConn(c) {
  let sub = synth.observable().subscribe(
    function(event) {
      c.sendUTF(JSON.stringify(event))
    }
  )
  c.on('close', function() {
    sub.dispose()
  })
}

function handleControlConn(c) {
  // TODO let [control, release] = synth.acquire()
  let control = synth.acquire()
  c.sendUTF(JSON.stringify(control.config()))
  c.on('message', function(m) {
    if (m.type === 'utf8') {
      let data = JSON.parse(m.utf8Data)
      control.setValue(data.value)
    }
  })
  c.on('close', function() {
    // TODO release()
    synth.release(control)
  })
}

wss.on('request', function(req) {
  if (req.resource === '/synth') {
    let c = req.accept()
    handleSynthConn(c)
    return
  }
  if (req.resource === '/control') {
    let c = req.accept()
    handleControlConn(c)
    return
  }
  req.reject()
})

server.listen(8080, function() {
  console.log('listening')
})