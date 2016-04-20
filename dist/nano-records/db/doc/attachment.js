var err_1 = require('../../err');
var stream = require('stream');
var DbDocAttachment = (function () {
    function DbDocAttachment(doc) {
        this.doc = doc;
    }
    DbDocAttachment.prototype.persist = function (id, name, data, mimeType, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.doc.get(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.attachment.persist(name, data, mimeType, callback); // attempt attachment
        });
    };
    DbDocAttachment.prototype.get = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id) {
            callback(err_1.default.missing('doc'));
            return;
        }
        // doesn't need `_rev` so we can skip `doc.get`
        this._performGet(id, name, callback);
    };
    DbDocAttachment.prototype._performGet = function (id, name, callback) {
        // TODO: truthfully this returns pretty ugly streams when there is an error
        // would be nice to clean this up
        this.doc.db.raw.attachment.get(id, name, {}, function (err, data) {
            callback(err_1.default.make('attachment', err), data);
        });
    };
    DbDocAttachment.prototype.read = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id) {
            callback(err_1.default.missing('doc'));
            // return empty stream
            var readable = new stream.Readable();
            readable._read = function () { };
            readable.push(null);
            return readable;
        }
        return this._performRead(id, name, callback);
    };
    DbDocAttachment.prototype._performRead = function (id, name, callback) {
        return this.doc.db.raw.attachment.get(id, name, {}, function (err) {
            callback(err_1.default.make('attachment', err));
        });
    };
    DbDocAttachment.prototype.erase = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.doc.get(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.attachment.erase(name, callback); // attempt erase
        });
    };
    return DbDocAttachment;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DbDocAttachment;
