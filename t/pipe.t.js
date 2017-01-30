require('proof')(5, prove)

function prove (assert) {
    var stream = require('stream')
    var net = {
        Socket: function (options) {
            assert(options, { fd: 3 }, 'socket')
            this.destroy = function () {
                assert(true, 'pipe destroyed')
            }
        }
    }
    var openPipe = require('../pipe')(net), pipe
    pipe = openPipe({
        env: { PIPE: '3' }
    }, 'PIPE')
    pipe.destroy()
    var input = new stream.PassThrough
    var output = new stream.PassThrough
    pipe = openPipe({
        env: { PIPE: 'input/output' },
        input: input,
        output: output
    }, 'PIPE')
    assert(input === pipe.input, 'input property')
    assert(output === pipe.output, 'output property')
    pipe.destroy()
    pipe = openPipe({
        env: { PIPE: '' },
        input: input,
        output: output
    }, 'PIPE')
    assert(pipe, null, 'pipe not found')
}
