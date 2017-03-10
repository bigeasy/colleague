var abend = require('abend')
var cadence = require('cadence')
var coalesce = require('nascent.coalesce')
var getPipe = require('./pipe')(require('net'))
var Conduit = require('conduit')
var Procession = require('procession')
var Destructor = require('destructible')

// TODO Rethink? Can't this be a bit more direct?
function Colleague (conference) {
    this._destructor = new Destructor
    this._conference = conference
    this.demolition = this._destructor.events
}

Colleague.prototype.connect = cadence(function (async, process) {
    var pipe = getPipe(process, coalesce(process.env['COMPASSION_COLLEAGUE_FD'], 'stdin/stdout'))
    var conduit = new Conduit(pipe.input, pipe.output)
    conduit.read.pump(this._conference.write)
    this._conference.read.pump(conduit.write)
    this._destructor.async(async, 'conduit')(function () {
        this._destructor.addDestructor('conduit', conduit.destroy.bind(conduit))
        conduit.listen(async())
    })
})

Colleague.prototype.destroy = function (callback) {
    this._destructor.destroy()
}

module.exports = Colleague
