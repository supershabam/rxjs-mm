// assume nx exists. It has an error importing right now :(

import rxdom from 'rx-dom'
import rx from 'rx'

function transpose(a) {
  return a[0].map(function(col, i) { 
    return a.map(function(row) { 
      return row[i] 
    })
  })
}

function wsURL() {
  let scheme = 'ws'
  if (window.location.protocol === 'https:') {
    scheme = 'wss'
  }
  return `${scheme}://${window.location.host}/control`
}

let ws = rxdom.DOM.fromWebSocket(wsURL())
let published = ws.publish() // single hot observable

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

published.take(1).map(function(m) {
  return JSON.parse(m.data)
}).subscribe(function(state) {
  // buttons send a {value: Integer} event where value is 0 or 1
  if (state.type === 'note') {
    let widget = nx.add('button')
    widget.sendsTo(function(data) {
      ws.onNext(JSON.stringify({
        value: data.press
      }))
    })
  }

  if (state.type === 'crusher') {
    let widget = nx.add('slider')
    widget.sendsTo(function(data) {
      ws.onNext(JSON.stringify({
        value: ~~(data.value * 8)
      }))
    })
  }

  if (state.type === 'matrix') {
    let widget = nx.add('matrix', {
      w: document.body.clientWidth
    })
    widget.row = state.row
    widget.col = state.col
    widget.init()
    widget.draw()
    widget.sendsTo(function(data) {
      ws.onNext(JSON.stringify({
        value: matrixToScoreline(widget.matrix)
      }))
    })
  }
})

let connection = published.connect() // create the observable