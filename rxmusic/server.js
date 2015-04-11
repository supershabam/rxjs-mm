'use strict'

let http = require('http')
let rx = require('rx')
let WebSocketServer = require('websocket').server
let Synth = require('./synth')

let synth = new Synth()

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
  let sub = synth.observable().subscribe(
    function(event) {
      c.sendUTF(JSON.stringify(event))
    }
  )
  c.on('close', function() {
    sub.dispose()
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