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
var err_1 = require('./err');
var stream = require('stream');
var DbDocAttachment = (function () {
    function DbDocAttachment(doc) {
        this.doc = doc;
    }
    DbDocAttachment.prototype.read = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id)
            callback(err_1.default.missingId('attachment'));
        else if (!name)
            callback(err_1.default.missingParam('attachment', "name"));
        else
            this._performRead(id, name, callback);
    };
    DbDocAttachment.prototype._performRead = function (id, name, callback) {
        this.doc.db.raw.attachment.get(id, name, {}, err_1.default.resultFunc('attachment', callback));
    };
    DbDocAttachment.prototype.createReadStream = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id) {
            callback(err_1.default.missingId('attachment'));
            return this._emptyStream();
        }
        else if (!name) {
            callback(err_1.default.missingParam('attachment', "name"));
            return this._emptyStream();
        }
        else
            return this._performCreateReadStream(id, name, callback);
    };
    DbDocAttachment.prototype._emptyStream = function () {
        var readable = new stream.Readable();
        readable._read = function () { };
        readable.push(null);
        return readable;
    };
    DbDocAttachment.prototype._performCreateReadStream = function (id, name, callback) {
        // TODO: truthfully this returns pretty ugly streams when there is an error
        // would be nice to clean up
        return this.doc.db.raw.attachment.get(id, name, {}, err_1.default.resultFunc('attachment', callback));
    };
    DbDocAttachment.prototype.write = function (id, name, data, mimeType, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id)
            callback(err_1.default.missingId('attachment'));
        else if (!name)
            callback(err_1.default.missingParam('attachment', "name"));
        else if (!data)
            callback(err_1.default.missingParam('attachment', "data"));
        else if (!mimeType)
            callback(err_1.default.missingParam('attachment', "mimeType"));
        else
            this._write(id, name, data, mimeType, callback);
    };
    DbDocAttachment.prototype._write = function (id, name, data, mimeType, callback, tries) {
        var _this = this;
        if (tries === void 0) { tries = 0; }
        tries++;
        this.doc.head(id, function (err, rev) {
            if (err)
                callback(err);
            else {
                _this._performWrite(id, rev, name, data, mimeType, function (err) {
                    if (err) {
                        if (tries <= _this.doc.db.maxTries && err.name == "conflict")
                            _this._write(id, name, data, mimeType, callback, tries);
                        else
                            callback(err);
                    }
                    else
                        callback(); // successfully written
                });
            }
        });
    };
    DbDocAttachment.prototype._performWrite = function (id, rev, name, data, mimeType, callback) {
        this.doc.db.raw.attachment.insert(id, name, data, mimeType, { rev: rev }, err_1.default.resultFunc('attachment', callback));
    };
    DbDocAttachment.prototype.destroy = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id)
            callback(err_1.default.missingId('attachment'));
        else if (!name)
            callback(err_1.default.missingParam('attachment', "name"));
        else
            this._destroy(id, name, callback);
    };
    DbDocAttachment.prototype._destroy = function (id, name, callback, tries) {
        var _this = this;
        if (tries === void 0) { tries = 0; }
        tries++;
        this.doc.head(id, function (err, rev) {
            if (err)
                callback(err);
            else {
                _this._performDestroy(id, rev, name, function (err) {
                    if (err) {
                        if (tries <= _this.doc.db.maxTries && err.name == "conflict")
                            _this._destroy(id, name, callback, tries);
                        else
                            callback(err);
                    }
                    else
                        callback(); // successfully destroyed
                });
            }
        });
    };
    DbDocAttachment.prototype._performDestroy = function (id, rev, name, callback) {
        this.doc.db.raw.attachment.destroy(id, name, { rev: rev }, err_1.default.resultFunc('attachment', callback));
    };
    return DbDocAttachment;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DbDocAttachment;
