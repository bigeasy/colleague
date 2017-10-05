var abend = require('abend')
var cadence = require('cadence')
var coalesce = require('extant')
var getPipe = require('./pipe')(require('net'))
var Conduit = require('conduit')
var Destructible = require('destructible')
var Signal = require('signal')

function Colleague (conference) {
    this._destructible = new Destructible(1000, 'colleague')
    this._conference = conference
    this.ready = new Signal
}

Colleague.prototype.listen = cadence(function (async, process) {
    var pipe = getPipe(process, coalesce(process.env['COMPASSION_COLLEAGUE_FD'], 'stdin/stdout'))
    var conduit = new Conduit(pipe.input, pipe.output, this._conference)
    async(function () {
        this._destructible.addDestructor('conduit', conduit.destroy.bind(conduit))
        conduit.ready.wait(async())
        conduit.listen(null, this._destructible.monitor('conduit'))
    }, function () {
        this._conference.write.push({ module: 'colleague', method: 'pipe' })
        this.ready.unlatch()
        this._destructible.completed.wait(async())
    })
})

Colleague.prototype.destroy = function (callback) {
    this._destructible.destroy()
}

module.exports = Colleague
