var Basin = require('conduit/basin')
var Responder = require('conduit/responder')

function Adapter (delegate) {
    this._delegate = delegate
    this._responder = new Responder(this, 'outOfBand')
    this.basin = this._responder.basin
    this._basin = new Basin(this)
    this._responder.spigot.emptyInto(this._basin)
}

Adapter.prototype.request = function (envelope, callback) {
    this._delegate._outOfBand(envelope, callback)
}

Adapter.prototype.fromBasin = function (envelope, callback) {
    switch (envelope.method) {
    case 'entry':
        envelope = envelope.body
        switch (envelope.method) {
        case 'join':
            this._delegate._join(envelope.body.colleague, envelope.body.entry, callback)
            break
        case 'entry':
            this._delegate._entry(envelope.body.entry, callback)
            break
        case 'replay':
            this._delegate._replay(envelope.body.record, callback)
            break
        }
        break
    }
}

module.exports = Adapter
