var abend = require('abend')
var cadence = require('cadence')
var coalesce = require('nascent.coalesce')
var getPipe = require('./pipe')(require('net'))
var Multiplexer = require('conduit/multiplexer')
var Spigot = require('conduit/spigot')
var Basin = require('conduit/basin')
var Destructor = require('destructible')

function Program (colleague) {
    this._colleague = colleague
}

Program.prototype.fromSpigot = function (envelope, callback) {
    this._colleague._basin.responses.enqueue(envelope, callback)
}

Program.prototype.fromBasin = function (envelope, callback) {
    this._colleague._spigot.requests.enqueue(envelope, callback)
}

function Socket (colleague) {
    this._colleague = colleague
}

Socket.prototype.fromSpigot = function (envelope, callback) {
    this._colleague.basin.responses.enqueue(envelope, callback)
}

Socket.prototype.fromBasin = function (envelope, callback) {
    this._colleague.spigot.requests.enqueue(envelope, callback)
}

// TODO Rethink? Can't this be a bit more direct?
function Colleague (conference) {
    this._destructor = new Destructor
    this._conference = conference
    this.spigot = new Spigot(new Program(this))
    this.basin = new Basin(new Program(this))
    this._spigot = new Spigot(new Socket(this))
    this._basin = new Basin(new Socket(this))
    this.demolition = this._destructor.events
}

var Terminator = require('destructible/terminator')

Colleague.prototype.connect = cadence(function (async, process) {
    var pipe = getPipe(process, coalesce(process.env['COMPASSION_COLLEAGUE_FD'], 'stdin/stdout'))
    var multiplexer = new Multiplexer(pipe.input, pipe.output, { object: conference, method: 'connect' })
    this._destructor.async(async, 'multiplexer')(function () {
        this._destructor.addDestructor('multiplexer', multiplexer.destroy.bind(multiplexer))
        multiplexer.listen(async())
    })
    // TODO Want to shutdown on an error here.
    // this._desetructor.rescue(async)(...)
        async(function () {
            multiplexer.connect(async())
        }, function (socket) {
            this._socket = socket
            this._conference.spigot.emptyInto(socket.basin)
            socket.spigot.emptyInto(this._conference.basin)
        })
})

Colleague.prototype.destroy = function (callback) {
    this._destructor.destroy()
}

Colleague.prototype.

module.exports = Colleague
