var err_1 = require('../../err');
var stream = require('stream');
var DbDocAttachment = (function () {
    function DbDocAttachment(doc) {
        this.doc = doc;
    }
    DbDocAttachment.prototype.write = function (id, name, data, mimeType, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.doc.get(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.attachment.write(name, data, mimeType, callback); // attempt write
        });
    };
    DbDocAttachment.prototype.read = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id) {
            callback(err_1.default.missing('doc'));
            return;
        }
        // doesn't need `_rev` so we can skip `doc.get`
        this._performRead(id, name, callback);
    };
    DbDocAttachment.prototype._performRead = function (id, name, callback) {
        this.doc.db.raw.attachment.get(id, name, {}, function (err, data) {
            callback(err_1.default.make('attachment', err), data);
        });
    };
    DbDocAttachment.prototype.readable = function (id, name, callback) {
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
    DbDocAttachment.prototype._performReadable = function (id, name, callback) {
        // TODO: truthfully this returns pretty ugly streams when there is an error
        // would be nice to clean this up
        return this.doc.db.raw.attachment.get(id, name, {}, function (err) {
            callback(err_1.default.make('attachment', err));
        });
    };
    DbDocAttachment.prototype.destroy = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.doc.get(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.attachment.destroy(name, callback); // attempt destroy
        });
    };
    return DbDocAttachment;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DbDocAttachment;
