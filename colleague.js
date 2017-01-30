var cadence = require('cadence')
var getPipe = require('./pipe')(require('net'))
var Multiplexer = require('conduit/multiplexer')
var Spigot = require('conduit/spigot')
var Basin = require('conduit/basin')
var Responder = require('conduit/responder')
var Prefixer = require('conduit/prefixer')

function Colleague (process) {
    var pipe = getPipe(process, 'COLLEAGUE_CHILD_FD')
    this._multiplexer = new Multiplexer(null, pipe.input, pipe.output)
    this._outOfBandNumber = 0
    // TODO Should be underbarred, right? Rename to Requester.
    this._spigot = new Spigot.Generator
    this.spigot = new Spigot.Generator
}

Colleague.prototype.connect = cadence(function (async) {
    async(function () {
        this._multiplexer.connect(async())
    }, function (socket) {
        this._socket = socket
        this._spigot.emptyInto(socket.basin)
        socket.spigot.emptyInto(new Basin.Responder(new Responder(this, new Prefixer)))
    })
})

// Responder interface for events sent by the consensus algorithm and other
// colleagues.

// Consume an atomic log entry.

//
Colleague.prototype._entry = cadence(function (async, envelope) {
    this.spigot.request({
        module: 'colleague',
        method: 'entry',
        body: envelope
    }, async())
})

//
Colleague.prototype._outOfBand = cadence(function (async, envelope) {
    this.spigot.request({
        module: 'colleague',
        method: 'outOfBand',
        body: envelope
    }, async())
})

//
Colleague.prototype._replay = cadence(function (async, envelope) {
    this.spigot.request({
        module: 'colleague',
        method: 'replay',
        body: envelope
    }, async())
})

Colleague.prototype.naturalized = function (callback) {
    this._spigot.send({
        module: 'colleague',
        method: 'naturalize',
        body: null
    }, callback)
}

Colleague.prototype.record = cadence(function (async, record, callback) {
    this._spigot.send({
        module: 'colleague',
        method: 'record',
        body: record
    }, callback)
    this._spigot.request({
        module: 'colleague',
        method: 'replay',
        body: record
    }, async())
})

// Any error is going to crash. No retry. We are going to ask the current
// leader. If the leader is not there or responds with any sort of error code,
// we crash. Out-of-band data is supposed to be used to abtain a mirror of an
// initial state, probably through an atomic immigration entry processor, so if
// the leader is unresponsive, and the government has changed, we're not going
// to be able to wait until things get better. We can't process the log until
// we're initialized. Deadlock. Crash and start over.
//
// The leader doesn't necessarily need to be the leader. That is application
// dependant. It only needs to have the state information necessary to
// initialize the new participant. Unless the application developer wants us to
// crash, we're not going to crash if leadership changes, only if the leader at
// the time of immigration has gone away or is unable to respond.

//
Colleague.prototype.outOfBand = cadence(function (async, name, post) {
    var outOfBandNumber = this._outOfBandNumber++
    async(function () {
        this._socket.request({ cookie: 'outOfBand', to: name, body: post }, async())
    }, function (response) {
        this._socket.enqueue({
            cookie: 'outOfBandReturn',
            to: null,
            body: { invocation: outOfBandReturn, response: response }
        })
        return [ response ]
    })
})

Colleague.prototype.publish = function (envelope, callback) {
    this._spigot.send({
        module: 'colleague',
        method: 'publish',
        body: envelope
    }, callback)
}

Colleague.prototype.close = cadence(function (async) {
    this._spigot.send(null, async())
})

module.exports = Colleague
