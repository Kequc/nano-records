/* class DbDoc
 *
 * Acts as an entry point to this library's document interfaces.
 * Expects a id to be specified on almost every operation and generally
 * returns a Doc instance.
 *
 * Most methods mirror those which are available on the Doc
 * class.
 *
 */
"use strict";
var err_1 = require('./err');
var doc_1 = require('./doc');
var db_doc_attachment_1 = require('./db-doc-attachment');
var deepExtend = require('deep-extend');
var DbDoc = (function () {
    function DbDoc(db) {
        this.db = db;
        this.attachment = new db_doc_attachment_1.default(this);
    }
    DbDoc.prototype.create = function (body, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!body)
            callback(err_1.default.missingParam('doc', "body"));
        else
            this._performWriteAndInstantiateDoc(undefined, undefined, body, callback);
    };
    DbDoc.prototype.read = function (id, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id)
            callback(err_1.default.missingId('doc'));
        else
            this._read(id, callback);
    };
    DbDoc.prototype._read = function (id, callback, tries) {
        var _this = this;
        if (tries === void 0) { tries = 0; }
        tries++;
        this._performRead(id, function (err, result) {
            if (err) {
                if (tries <= 1 && err.name == "no_db_file") {
                    // create db
                    _this.db.create(function (err) {
                        if (err && err.name != "db_already_exists")
                            callback(err);
                        else
                            _this._read(id, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else
                callback(undefined, new doc_1.default(_this.db, result)); // document found!
        });
    };
    DbDoc.prototype._performRead = function (id, callback) {
        this.db.raw.get(id, err_1.default.resultFunc('doc', callback));
    };
    DbDoc.prototype.write = function (id, body, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id)
            callback(err_1.default.missingId('doc'));
        else if (!body)
            callback(err_1.default.missingParam('doc', "body"));
        else
            this._write(id, body, callback);
    };
    DbDoc.prototype._write = function (id, body, callback, tries) {
        var _this = this;
        if (tries === void 0) { tries = 0; }
        tries++;
        this.head(id, function (err, rev) {
            _this._performWriteAndInstantiateDoc(id, rev, body, function (err, doc) {
                if (err) {
                    if (tries <= _this.db.maxTries && err.name == "conflict")
                        _this._write(id, body, callback, tries);
                    else
                        callback(err);
                }
                else
                    callback(undefined, doc); // successfully written
            });
        });
    };
    DbDoc.prototype.update = function (id, body, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id)
            callback(err_1.default.missingId('doc'));
        else if (!body)
            callback(err_1.default.missingParam('doc', "body"));
        else
            this._update(id, body, callback);
    };
    DbDoc.prototype._update = function (id, body, callback) {
        this.read(id, function (err, doc) {
            if (err)
                callback(err);
            else {
                // may as well call update on doc
                doc.update(body, function (err) {
                    if (err)
                        callback(err);
                    else
                        callback(undefined, doc); // successfully updated
                });
            }
        });
    };
    DbDoc.prototype.updateOrWrite = function (id, body, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id)
            callback(err_1.default.missingId('doc'));
        else if (!body)
            callback(err_1.default.missingParam('doc', "body"));
        else
            this._updateOrWrite(id, body, callback);
    };
    DbDoc.prototype._updateOrWrite = function (id, body, callback, tries) {
        var _this = this;
        if (tries === void 0) { tries = 0; }
        tries++;
        this.update(id, body, function (err, doc) {
            if (err) {
                if (err.name == "not_found") {
                    _this._performWriteAndInstantiateDoc(id, undefined, body, function (err, doc) {
                        if (err) {
                            if (tries <= _this.db.maxTries && err.name == "conflict") {
                                // document exists
                                _this._updateOrWrite(id, body, callback, tries);
                            }
                            else
                                callback(err);
                        }
                        else
                            callback(undefined, doc); // successfully written
                    });
                }
                else
                    callback(err);
            }
            else
                callback(undefined, doc); // successfully updated
        });
    };
    DbDoc.prototype._performWriteAndInstantiateDoc = function (id, rev, body, callback, tries) {
        var _this = this;
        if (tries === void 0) { tries = 0; }
        tries++;
        var clone = deepExtend({}, body);
        this._performWrite(id, rev, clone, function (err, result) {
            if (err) {
                if (tries <= 1 && err.name == "no_db_file") {
                    // create db
                    _this.db.create(function (err) {
                        if (err && err.name != "db_already_exists")
                            callback(err);
                        else
                            _this._performWriteAndInstantiateDoc(id, rev, body, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else
                callback(undefined, new doc_1.default(_this.db, clone, result)); // written successfully
        });
    };
    DbDoc.prototype._performWrite = function (id, rev, body, callback) {
        body['_rev'] = rev;
        this.db.raw.insert(body, id, err_1.default.resultFunc('doc', callback));
    };
    DbDoc.prototype.destroy = function (id, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id)
            callback(err_1.default.missingId('doc'));
        else
            this._destroy(id, callback);
    };
    DbDoc.prototype._destroy = function (id, callback, tries) {
        var _this = this;
        if (tries === void 0) { tries = 0; }
        tries++;
        this.head(id, function (err, rev) {
            if (err)
                callback(err);
            else {
                _this._performDestroy(id, rev, function (err) {
                    if (err) {
                        if (tries <= _this.db.maxTries && err.name == "conflict")
                            _this._destroy(id, callback, tries);
                        else
                            callback(err);
                    }
                    else
                        callback(); // successfully destroyed
                });
            }
        });
    };
    DbDoc.prototype._performDestroy = function (id, rev, callback) {
        this.db.raw.destroy(id, rev, err_1.default.resultFunc('doc', callback));
    };
    DbDoc.prototype.head = function (id, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id)
            callback(err_1.default.missingId('doc'));
        else
            this._head(id, callback);
    };
    DbDoc.prototype._head = function (id, callback, tries) {
        var _this = this;
        if (tries === void 0) { tries = 0; }
        tries++;
        this._performHead(id, function (err, rev, result) {
            if (err) {
                if (tries <= 1 && err.name == "no_db_file") {
                    // create db
                    _this.db.create(function (err) {
                        if (err && err.name != "db_already_exists")
                            callback(err);
                        else
                            _this._head(id, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else
                callback(undefined, rev, result); // success
        });
    };
    DbDoc.prototype._performHead = function (id, callback) {
        // here we need the third parameter
        // not the second
        // the second seems empty...
        this.db.raw.head(id, function (raw, body, result) {
            var err = err_1.default.make('doc', raw);
            if (err)
                callback(err);
            else if (result['etag']) {
                // we have a new rev
                // nano puts it in the format '"etag"' so we need to
                // strip erroneous quotes
                callback(undefined, result['etag'].replace(/"/g, ""), result);
            }
            else
                callback(new err_1.default('doc', "missing_rev", "Rev missing from header response."));
        });
    };
    return DbDoc;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DbDoc;
