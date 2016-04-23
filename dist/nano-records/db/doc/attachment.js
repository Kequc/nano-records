/* class DbDocAttachment
 *
 * Acts as an entry point to this library's document attachment
 * interfaces. Expects a id to be specified on every operation
 * and generally doesn't return anything. It may be nice in the
 * future to return newly created Doc instances.
 *
 * Most methods mirror those which are available on the
 * DocAttachment class.
 *
 */
"use strict";
var err_1 = require('../../err');
var doc_1 = require('../../doc');
var stream = require('stream');
var DbDocAttachment = (function () {
    function DbDocAttachment(doc) {
        this.doc = doc;
    }
    DbDocAttachment.prototype.write = function (id, name, data, mimeType, callback) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (!id) {
            callback(err_1.default.missingId('doc'));
            return;
        }
        // TODO: this is also inefficient since we might attempt to
        // write the attachment first without looking up the document
        // if the document doesn't exist the operation would be
        // successful
        this.doc.read(id, function (err, doc) {
            if (err) {
                if (err.name == "not_found")
                    // we'll do it live!
                    _this._performWrite(id, name, data, mimeType, function (err, result) {
                        if (err)
                            callback(err);
                        else {
                            var doc_2 = new doc_1.default(_this.doc.db, {}, result);
                            doc_2.body['_attachments'] = {};
                            doc_2.body['_attachments'][name] = {};
                            callback(undefined, doc_2);
                        }
                    });
                else
                    callback(err);
            }
            else {
                // attempt write
                doc.attachment.write(name, data, mimeType, function (err) {
                    if (err)
                        callback(err);
                    else
                        callback(undefined, doc); // success
                });
            }
        });
    };
    DbDocAttachment.prototype._performWrite = function (id, name, data, mimeType, callback) {
        this.doc.db.raw.attachment.insert(id, name, data, mimeType, {}, err_1.default.resultFunc('attachment', callback));
    };
    DbDocAttachment.prototype.read = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id) {
            callback(err_1.default.missingId('doc'));
            return;
        }
        // doesn't need `_rev` so we can skip `doc.get`
        this._performRead(id, name, callback);
    };
    DbDocAttachment.prototype._performRead = function (id, name, callback) {
        this.doc.db.raw.attachment.get(id, name, {}, err_1.default.resultFunc('attachment', callback));
    };
    DbDocAttachment.prototype.readStream = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id) {
            callback(err_1.default.missingId('doc'));
            // return empty stream
            var readable = new stream.Readable();
            readable._read = function () { };
            readable.push(null);
            return readable;
        }
        return this._performReadStream(id, name, callback);
    };
    DbDocAttachment.prototype._performReadStream = function (id, name, callback) {
        // TODO: truthfully this returns pretty ugly streams when there is an error
        // would be nice to clean this up
        return this.doc.db.raw.attachment.get(id, name, {}, err_1.default.resultFunc('attachment', callback));
    };
    DbDocAttachment.prototype.destroy = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id) {
            callback(err_1.default.missingId('doc'));
            return;
        }
        // TODO: this is inefficiant and could probably be done with only
        // a head request probably
        this.doc.read(id, function (err, doc) {
            if (err)
                if (err.name == "not_found")
                    callback(); // nothing to see here
                else
                    callback(err);
            else
                doc.attachment.destroy(name, callback); // attempt destroy
        });
    };
    return DbDocAttachment;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DbDocAttachment;
