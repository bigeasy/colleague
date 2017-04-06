require('proof')(5, prove)

function prove (assert) {
    var stream = require('stream')
    var net = {
        Socket: function (options) {
            assert(options, { fd: '3' }, 'socket')
            this.destroy = function () {
                assert(true, 'pipe destroyed')
            }
        }
    }
    var openPipe = require('../pipe')(net), pipe
    pipe = openPipe({}, '3')
    pipe.destroy()
    var input = new stream.PassThrough
    var output = new stream.PassThrough
    pipe = openPipe({
        input: input,
        output: output
    }, 'input/output')
    assert(input === pipe.input, 'input property')
    assert(output === pipe.output, 'output property')
    pipe.destroy()
    pipe = openPipe({}, '')
    assert(pipe, null, 'pipe not found')
}
