var coalesce = require('nascent.coalesce')
var noop = require('nop')

module.exports = function (net) {
    return function (process, variable) {
        var pipe = coalesce(process.env[variable]), $
        if (/^\d+$/.test(pipe)) {
            pipe = new net.Socket({ fd: pipe })
            return {
                input: pipe,
                output: pipe,
                destroy: function () { pipe.destroy() }
            }
        }
        if (($ = /^([^\/]+)\/(.*)$/.exec(pipe)) != null) {
            return {
                input: process[$[1]],
                output: process[$[2]],
                destroy: noop
            }
        }
        return null
    }
}
