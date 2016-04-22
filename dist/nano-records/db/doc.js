/* class DbDoc
 *
 * Acts as an entry point to this library's document interfaces.
 * Expects a id to be specified on every operation and generally
 * returns a Doc instance.
 *
 * Most methods mirror those which are available on the Doc
 * class.
 *
 */
"use strict";
var err_1 = require('../err');
var doc_1 = require('../doc');
var attachment_1 = require('./doc/attachment');
var deepExtend = require('deep-extend');
var DbDoc = (function () {
    function DbDoc(db) {
        this.db = db;
        this.attachment = new attachment_1.default(this);
    }
    DbDoc.prototype.create = function (body, callback, tries) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        tries++;
        this._performWriteAndInstantiateDoc(undefined, body, function (err, doc) {
            if (err) {
                if (tries <= 1 && err.name == "no_db_file") {
                    // create db
                    _this.db.create(function (err) {
                        if (err)
                            callback(err);
                        else
                            _this.create(body, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else
                callback(undefined, doc); // created successfully
        });
    };
    DbDoc.prototype.write = function (id, body, callback) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        this.read(id, function (err, doc) {
            if (err) {
                if (err.name == "not_found")
                    _this._performWriteAndInstantiateDoc(id, body, callback); // we'll do it live!
                else
                    callback(err);
            }
            else {
                // attempt write
                doc.write(body, function (err) {
                    if (err)
                        callback(err);
                    else
                        callback(undefined, doc);
                });
            }
        });
    };
    DbDoc.prototype.update = function (id, body, callback) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (!id) {
            callback(err_1.default.missingId('doc'));
            return;
        }
        this.read(id, function (err, doc) {
            if (err) {
                if (err.name == "not_found")
                    _this._performWriteAndInstantiateDoc(id, body, callback); // we'll do it live!
                else
                    callback(err);
            }
            else {
                // attempt update
                doc.update(body, function (err) {
                    if (err)
                        callback(err);
                    else
                        callback(undefined, doc); // successfully updated
                });
            }
        });
    };
    DbDoc.prototype._performWriteAndInstantiateDoc = function (id, body, callback) {
        var _this = this;
        this._performWrite(id, body, function (err, result) {
            if (err)
                callback(err, undefined);
            else {
                var doc = new doc_1.default(_this.db, body);
                doc.body['_id'] = result['id'];
                doc.body['_rev'] = result['rev'];
                callback(undefined, doc); // written successfully
            }
        });
    };
    DbDoc.prototype._performWrite = function (id, body, callback) {
        this.db.raw.insert(deepExtend({}, body, { '_id': id, '_rev': undefined }), function (err, result) {
            callback(err_1.default.make('doc', err), result);
        });
    };
    DbDoc.prototype.read = function (id, callback, tries) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!id) {
            callback(err_1.default.missingId('doc'));
            return;
        }
        tries++;
        this._performRead(id, function (err, result) {
            if (err)
                if (tries <= 1 && err.name == "no_db_file") {
                    // create db
                    _this.db.create(function (err) {
                        if (err)
                            callback(err);
                        else
                            _this.read(id, callback, tries);
                    });
                }
                else
                    callback(err);
            else
                callback(undefined, new doc_1.default(_this.db, result)); // document found!
        });
    };
    DbDoc.prototype._performRead = function (id, callback) {
        this.db.raw.get(id, function (err, result) {
            callback(err_1.default.make('doc', err), result);
        });
    };
    DbDoc.prototype.head = function (id, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id) {
            callback(err_1.default.missingId('doc'));
            return;
        }
        this._performHead(id, callback);
    };
    DbDoc.prototype._performHead = function (id, callback) {
        this.db.raw.head(id, function (err, body, result) {
            callback(err_1.default.make('doc', err), result);
        });
    };
    DbDoc.prototype.destroy = function (id, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.read(id, function (err, doc) {
            if (err) {
                if (err.name == "not_found")
                    callback(); // nothing to see here
                else
                    callback(err);
            }
            else
                doc.destroy(callback); // attempt destroy
        });
    };
    return DbDoc;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DbDoc;
