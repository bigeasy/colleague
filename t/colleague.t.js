require('proof')(2, require('cadence')(prove))

function prove (async, assert) {
    var cadence = require('cadence')
    var Colleague = require('..')
    var stream = require('stream')
    var input = new stream.PassThrough
    var output = new stream.PassThrough
    var abend = require('abend')
    var Vestibule = require('vestibule')
    var Multiplexer = require('conduit/multiplexer')
    var colleague = new Colleague({
        env: { 'COLLEAGUE_CHILD_FD': 'input/output' },
        input: input,
        output: output
    })
    var multiplexer
    async(function () {
        var wait = async()
        multiplexer = new Multiplexer(output, input, cadence(function (async, socket) {
            wait(null, socket)
        }))
        multiplexer.listen(abend)
        colleague.connect(async())
    }, function (socket) {
        var responses = socket.spigot.requests.shifter()
        async(function () {
            colleague.publish(1, async())
            responses.dequeue(async())
        }, function (message) {
            assert(message.body, { module: 'colleague', method: 'publish', body: 1 }, 'publish')
            responses.dequeue(async())
            colleague.naturalized(async())
        }, function (message) {
            assert(message.body, { module: 'colleague', method: 'naturalize', body: null }, 'naturalize')
            colleague.close(async())
            socket.spigot.responses.enqueue(null, async())
        })
    })
}
