require('proof/redux')(2, require('cadence')(prove))

function prove (async, assert) {
    var Adapter = require('../adapter')
    var Requester = require('conduit/requester')
    var delegate = {
        _outOfBand: function (envelope, callback) {
            assert(envelope, 1, 'out of band called')
            callback(null, 2)
        },
        _join: function (colleague, entry, callback) {
            assert(colleague.isColleague, 'join colleague')
            assert(entry.isEntry, 'join entry')
            callback()
        },
        _entry: function (entry, callback) {
            assert(entry.isEntry, 'entry')
            callback()
        },
        _replay: function (record, callback) {
            assert(record.isRecord, 'replay')
            callback()
        }
    }
    var requester = new Requester('outOfBand')
    var adapter = new Adapter(delegate)
    requester.spigot.emptyInto(adapter.basin)
    async(function () {
        requester.request('outOfBand', 1, async())
    }, function (result) {
        assert(result, 2, 'out of band returned')
        return [ async.break ]
        adapter.basin.requests.enqueue({
            module: 'colleague',
            method: 'join',
            body: {
                colleague: { isColleague: true },
                entry: { isEntry: true }
            }
        }, async())
    }, function () {
        adapter.basin.requests.enqueue({
            module: 'colleague',
            method: 'entry',
            body: {
                entry: { isEntry: true }
            }
        }, async())
    }, function () {
        adapter.basin.requests.enqueue({
            module: 'colleague',
            method: 'replay',
            body: {
                record: { isRecord: true }
            }
        }, async())
    })
}
