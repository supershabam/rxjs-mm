'use strict'

let http = require('http')
let rx = require('rx')
let WebSocketServer = require('websocket').server

let state = {
  q: 40,
  keys: []
}

let stateSubject = new rx.BehaviorSubject(state)

let server = http.createServer(function(req, resp) {
  console.log('normal request')
  resp.end()
})

server.listen(8080, function() {
  console.log('listening')
})

let wss = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
})

function handleSynthConn(c) {
  let subscription = stateSubject.subscribe(
    function(state) {
      c.sendUTF(JSON.stringify(state))
    }
  )
  c.on('close', function() {
    subscription.dispose()
  })
}

wss.on('request', function(req) {
  if (req.resource === '/synth') {
    let c = req.accept()
    handleSynthConn(c)
    return
  }
  req.reject()
})