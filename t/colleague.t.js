require('proof')(1, require('cadence')(prove))

function prove (async, okay) {
    var Colleague = require('..')

    var stream = require('stream')

    var input = new stream.PassThrough
    var output = new stream.PassThrough

    var Procession = require('procession')

    var Destructible = require('destructible')
    var destructible = new Destructible('t/colleague.t.js')

    async(function () {
        var conference = { read: new Procession, write: new Procession }
        destructible.monitor('colleague', Colleague, {
            env: { 'COMPASSION_COLLEAGUE_FD': 'input/output' },
            input: input,
            output: output
        }, conference, async())
    }, function () {
        okay(true, 'done')
    })
}
