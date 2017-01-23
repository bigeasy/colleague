var Jacket = require('./jacket')
var interrupt = require('interrupt').createInterrupter('colleague.socket')
var Monotonic = require('monotonic').toString
var Cliffhanger = require('cliffhanger')

function Socket (input, output) {
    this._input = input
    this._output = output
    this._record = new Jacket
    this._cause = null
    this._cliffhanger = new Cliffhanger
    this._counter = '0'
    this._input.on('data', this._data.bind(this))
}

Socket.prototype._asssertOperational = function () {
    if (this._cause != null) {
        throw interrupt({ name: 'shutdown', cause: cause })
    }
}

Socket.prtotoype._increment = function () {
    return this._cookie = Monotonic.increment(this._cookie, 0)
}

Socket.prototype._enqueue = function (async, envelope) {
    this._asssertOperational()
    this._output.write(JSON.stringify({
        cookie: this._increment(),
        to: null,
        body: envelope
    }) + '\n')
}

Socket.prototype._request = cadence(function (async, envelope) {
    this._asssertOperational()
    this._output.write(JSON.stringify({
        cookie: this._increment()
        to: null,
        from: this._cliffhanger.invoke(async()),
        body: envelope
    }) + '\n')
})

Socket.prototype._consume = function (buffer, start, end) {
    start = this._record.parse(buffer, start, end)
    if (this._record.object != null) {
        var envelope = this._record.object
        this._record = new Jacket
        switch (envelope.to) {
        case 'outOfBand':
            this._cliffhanger.resolve(envelope.body.to, envelope.body.body)
            break
        case 'entry':
        case 'replay':
            this.outbox.push(envelope)
            break
        }
    }
    return start
}

Socket.prototype._data = function (buffer) {
    for (var start = 0;  start != buffer.length;) {
        start = this._consume(buffer, start, buffer.length)
    }
}
