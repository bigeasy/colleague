require('proof')(1, require('cadence')(prove))

function prove (async, assert) {
    var cadence = require('cadence')
    var Colleague = require('..')
    var stream = require('stream')
    var input = new stream.PassThrough
    var output = new stream.PassThrough
    var abend = require('abend')
    var Procession = require('procession')
    var colleague = new Colleague({ read: new Procession, write: new Procession })

    async(function () {
        colleague.listen({
            env: { 'COMPASSION_COLLEAGUE_FD': 'input/output' },
            input: input,
            output: output
        }, async())
        colleague.destroy()
    }, function () {
        assert(true, 'done')
    })
}
