var abend = require('abend')
var cadence = require('cadence')
var coalesce = require('nascent.coalesce')
var getPipe = require('./pipe')(require('net'))
var Multiplexer = require('conduit/multiplexer')
var Spigot = require('conduit/spigot')
var Basin = require('conduit/basin')
var Responder = require('conduit/responder')
var Requester = require('conduit/requester')

function Program (colleague) {
    this._colleague = colleague
}

Program.prototype.fromSpigot = function (envelope, callback) {
    this._colleague._fromProgramSpigot(envelope, callback)
}

function Process (colleague) {
    this._colleague = colleague
}

Process.prototype.fromSpigot = function (envelope, callback) {
    this._colleague._fromProcessSpigot(envelope, callback)
}

Process.prototype.fromBasin = function (envelope, callback) {
    this._colleague._fromProcessBasin(envelope, callback)
}

Process.prototype.request = function (value, callback) {
    this._colleague._request(value, callback)
}

function Colleague (process) {
    var pipe = getPipe(process, coalesce(process.env['COMPASSION_COLLEAGUE_FD'], 'stdin/stdout'))
    this._multiplexer = new Multiplexer(pipe.input, pipe.output)
    this._outOfBandNumber = 0
    this._spigot = new Spigot(new Process(this))
    this._requester = new Requester('outOfBand')
    this._spigot.emptyInto(this._requester.basin)
    this._responder = new Responder(this, 'outOfBand')
    this._basin = new Basin(new Process(this))
    this._responder.spigot.emptyInto(this._basin)
    this.spigot = new Spigot(new Program(this))
}

Colleague.connect = function (process) {
    var colleague = new Colleague(process)
    colleague.connect(abend)
    return colleague
}

Colleague.prototype.connect = cadence(function (async) {
    async(function () {
        this._multiplexer.connect(async())
    }, function (socket) {
        this._socket = socket
        this._requester.spigot.emptyInto(socket.basin)
        socket.spigot.emptyInto(this._responder.basin)
    })
})

Colleague.prototype._fromProcessSpigot = function (envelope, callback) {
    callback()
}

Colleague.prototype._fromProcessBasin = function (envelope, callback) {
    this.spigot.requests.enqueue(envelope, callback)
}

Colleague.prototype._fromProgramSpigot = function (envelope, callback) {
    callback()
}

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
    this._spigot.requests.enqueue({
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
        this._requester.request({
            module: 'colleague',
            method: 'outOfBand',
            to: name,
            body: post
        }, async())
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
    this._spigot.requests.enqueue({
        module: 'colleague',
        method: 'publish',
        body: envelope
    }, callback)
}

Colleague.prototype.close = function (callback) {
    this._spigot.requests.enqueue(null, callback)
}

module.exports = Colleague
