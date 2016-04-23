/* class DocAttachment
 *
 * Manages attachment operations on a single instance of a single
 * document in the database. Methods called within this class do
 * not take an `_id` parameter and in general will stop working if
 * the document no longer has one.
 *
 * All methods assume that a database exists.
 *
 */
"use strict";
var err_1 = require('../err');
var devNull = require('dev-null');
var DocAttachment = (function () {
    function DocAttachment(doc) {
        this.doc = doc;
    }
    DocAttachment.prototype.list = function () {
        var attachments = [];
        for (var name_1 in (this.doc.body['_attachments'] || {})) {
            attachments.push(name_1);
        }
        ;
        return attachments;
    };
    DocAttachment.prototype.exists = function (name) {
        return !!(this.doc.body['_attachments'] && this.doc.body['_attachments'][name]);
    };
    DocAttachment.prototype.write = function (name, data, mimeType, callback, tries) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.doc.getId()) {
            callback(err_1.default.missingId('doc'));
            return;
        }
        tries++;
        this._performWrite(name, data, mimeType, function (err, result) {
            if (err) {
                if (tries <= _this.doc.db.maxTries && err.name == "conflict") {
                    _this.doc.read(function (err) {
                        if (err)
                            callback(err);
                        else
                            _this.write(name, data, mimeType, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else {
                // attachment written
                // TODO: Is there more information available here?
                _this.doc.body['_attachments'] = _this.doc.body['_attachments'] || {};
                _this.doc.body['_attachments'][name] = {};
                _this.doc.body['_rev'] = _this.doc._latestRev = result['rev'];
                callback();
            }
        });
    };
    DocAttachment.prototype._performWrite = function (name, data, mimeType, callback) {
        this.doc.db.raw.attachment.insert(this.doc.getId(), name, data, mimeType, { rev: this.doc.getRev() }, err_1.default.resultFunc('attachment', callback));
    };
    DocAttachment.prototype.read = function (name, callback) {
        if (callback === void 0) { callback = function () { }; }
        // we have a method already available for this on the db object
        this.doc.db.doc.attachment.read(this.doc.getId(), name, callback);
    };
    DocAttachment.prototype.readStream = function (name, callback) {
        if (callback === void 0) { callback = function () { }; }
        // we have a method already available for this on the db object
        return this.doc.db.doc.attachment.readStream(this.doc.getId(), name, callback);
    };
    DocAttachment.prototype.writeStream = function (name, mimetype, callback) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (!this.doc.getId()) {
            callback(err_1.default.missingId('doc'));
            return devNull();
        }
        return this._performWriteStream(name, null, mimetype, function (err, result) {
            if (err)
                callback(err);
            else {
                // attachment written
                // TODO: Is there more information available here?
                _this.doc.body['_attachments'] = _this.doc.body['_attachments'] || {};
                _this.doc.body['_attachments'][name] = {};
                _this.doc.body['_rev'] = _this.doc._latestRev = result['rev'];
                callback();
            }
        });
    };
    DocAttachment.prototype._performWriteStream = function (name, data, mimeType, callback) {
        return this.doc.db.raw.attachment.insert(this.doc.getId(), name, data, mimeType, { rev: this.doc.getRev() }, err_1.default.resultFunc('attachment', callback));
    };
    DocAttachment.prototype.destroy = function (name, callback, tries) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.doc.getId()) {
            callback(err_1.default.missingId('doc'));
            return;
        }
        tries++;
        this._performDestroy(name, function (err, result) {
            if (err) {
                if (tries <= _this.doc.db.maxTries && err.name == "conflict") {
                    _this.doc.read(function (err) {
                        if (err)
                            callback(err);
                        else
                            _this.destroy(name, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else {
                // attachment removed
                if (_this.doc.body['_attachments'])
                    delete _this.doc.body['_attachments'][name];
                _this.doc.body['_rev'] = _this.doc._latestRev = result['rev'];
                callback();
            }
        });
    };
    DocAttachment.prototype._performDestroy = function (name, callback) {
        this.doc.db.raw.attachment.destroy(this.doc.getId(), name, { rev: this.doc.getRev() }, err_1.default.resultFunc('attachment', callback));
    };
    return DocAttachment;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DocAttachment;
