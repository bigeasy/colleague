var coalesce = require('nascent.coalesce')
var noop = require('nop')

module.exports = function (net) {
    return function (process, handle) {
        if (/^\d+$/.test(handle)) {
            var pipe = new net.Socket({ fd: pipe })
            return {
                input: pipe,
                output: pipe,
                destroy: function () { pipe.destroy() }
            }
        }
        var $
        if (($ = /^([^\/]+)\/(.*)$/.exec(handle)) != null) {
            return {
                input: process[$[1]],
                output: process[$[2]],
                destroy: noop
            }
        }
        return null
    }
}
