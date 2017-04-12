var abend = require('abend')
var cadence = require('cadence')
var coalesce = require('extant')
var getPipe = require('./pipe')(require('net'))
var Conduit = require('conduit')
var Procession = require('procession')
var Destructible = require('destructible')
var Signal = require('signal')

function Colleague (conference) {
    this._destructible = new Destructible
    this._conference = conference
    this.demolition = this._destructible.events
    this.ready = new Signal
}

Colleague.prototype.listen = cadence(function (async, process) {
    var pipe = getPipe(process, coalesce(process.env['COMPASSION_COLLEAGUE_FD'], 'stdin/stdout'))
    var conduit = new Conduit(pipe.input, pipe.output)
    conduit.read.pump(this._conference.write, 'enqueue')
    this._conference.read.pump(conduit.write, 'enqueue')
    this._destructible.stack(async, 'conduit')(function (ready) {
        this._destructible.addDestructor('conduit', conduit.destroy.bind(conduit))
        conduit.listen(async())
        ready.unlatch()
    })
    this._destructible.ready.wait(this.ready, 'unlatch')
})

Colleague.prototype.destroy = function (callback) {
    this._destructible.destroy()
}

module.exports = Colleague
