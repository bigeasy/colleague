var cadence = require('cadence')

function Colleague (options) {
    this._socket = socket
    this._outOfBandNumber = 0
}

Colleague.prototype.record = function (name, message) {
    this._socket.enqueue({ cookie: 'record', to: name, body: message })
    this._consumer.replay(name, message)
}

Colleague.prototype.publish = function (message) {
    this._socket.enqueue({ cookie: 'publish', to: null, body: message })
}

Colleague.prototype._oob = cadence(function (async, envelope) {
    this._consumer.oob(envelope, async())
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

Colleague.prototype.naturalized = function () {
    this._socket.enqueue({ cookie: 'naturalize', to: null, body: null })
}

module.exports = Colleague
