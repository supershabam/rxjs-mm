// assume nx exists. It has an error importing right now :(

import rxdom from 'rx-dom'
import rx from 'rx'

function wsURL() {
  let scheme = 'ws'
  if (window.location.protocol === 'https:') {
    scheme = 'wss'
  }
  return `${scheme}://${window.location.host}/control`
}

let ws = rxdom.DOM.fromWebSocket(wsURL())
let published = ws.publish() // single hot observable

published.take(1).map(function(m) {
  return JSON.parse(m.data)
}).subscribe(function(state) {
  if (state.type === 'button') {
    let widget = nx.add('button')
    widget.sendsTo(function(data) {
      ws.onNext(JSON.stringify({
        value: data.press
      }))
    })
  }
})

let connection = published.connect() // create the observable