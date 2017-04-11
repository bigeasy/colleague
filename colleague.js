var abend = require('abend')
var cadence = require('cadence')
var coalesce = require('extant')
var getPipe = require('./pipe')(require('net'))
var Conduit = require('conduit')
var Procession = require('procession')
var Destructible = require('destructible')

function Colleague (conference) {
    this._destructible = new Destructible
    this._conference = conference
    this.demolition = this._destructible.events
}

Colleague.prototype.listen = cadence(function (async, process) {
    var pipe = getPipe(process, coalesce(process.env['COMPASSION_COLLEAGUE_FD'], 'stdin/stdout'))
    var conduit = new Conduit(pipe.input, pipe.output)
    conduit.read.pump(this._conference.write)
    this._conference.read.pump(conduit.write)
    this._destructible.async(async, 'conduit')(function (ready) {
        this._destructible.addDestructor('conduit', conduit.destroy.bind(conduit))
        conduit.listen(async())
        ready.unlatch()
    })
})

Colleague.prototype.destroy = function (callback) {
    this._destructible.destroy()
}

module.exports = Colleague
