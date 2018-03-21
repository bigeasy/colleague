var cadence = require('cadence')
var coalesce = require('extant')
var getPipe = require('./pipe')(require('net'))
var Conduit = require('conduit')

module.exports = cadence(function (async, destructible, process, conference) {
    var pipe = getPipe(process, coalesce(process.env['COMPASSION_COLLEAGUE_FD'], 'stdin/stdout'))
    async(function () {
        destructible.monitor('conduit', Conduit, pipe.input, pipe.output, conference, async())
    }, function () {
        conference.write.push({ module: 'colleague', method: 'pipe' })
    })
})
