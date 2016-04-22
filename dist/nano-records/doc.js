/* class Doc
 *
 * Manages a single instance of a single document in the database.
 * Methods called within this class do not take an `_id` parameter
 * and in general will stop working if the document no longer has
 * one. Ie. If the record was deleted.
 *
 * All methods assume that a database exists.
 *
 */
"use strict";
var err_1 = require('./err');
var attachment_1 = require('./doc/attachment');
var deepExtend = require('deep-extend');
var Doc = (function () {
    function Doc(db, body) {
        if (body === void 0) { body = {}; }
        this.db = db;
        this.body = deepExtend({}, body);
        this.attachment = new attachment_1.default(this);
    }
    Doc.prototype.getId = function () {
        return this.body['_id'];
    };
    Doc.prototype.getRev = function () {
        return this.body['_rev'];
    };
    Doc.prototype.getBody = function () {
        return deepExtend({}, this.body);
    };
    Doc.prototype.read = function (callback) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (!this.getId()) {
            callback(err_1.default.missingId('doc'));
            return;
        }
        this._performread(function (err, result) {
            if (err)
                callback(err);
            else {
                _this.body = result;
                callback(); // up to date
            }
        });
    };
    Doc.prototype._performread = function (callback) {
        this.db.raw.get(this.getId(), function (err, result) {
            callback(err_1.default.make('doc', err), result);
        });
    };
    Doc.prototype.head = function (callback) {
        if (callback === void 0) { callback = function () { }; }
        // we have a method already available for this on the db object
        this.db.doc.head(this.getId(), callback);
    };
    Doc.prototype.write = function (body, callback, tries) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.getId()) {
            callback(err_1.default.missingId('doc'));
            return;
        }
        tries++;
        this._performWrite(body, function (err, result) {
            if (err) {
                if (tries <= _this.db.maxTries && err.name == "conflict") {
                    _this.read(function (err) {
                        if (err)
                            callback(err);
                        else
                            _this.write(body, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else {
                _this.body = body;
                _this.body['_id'] = result['id'];
                _this.body['_rev'] = result['rev'];
                callback(); // success
            }
        });
    };
    Doc.prototype._performWrite = function (body, callback) {
        this.db.raw.insert(deepExtend({}, body, { '_id': this.getId(), '_rev': this.getRev() }), function (err, result) {
            callback(err_1.default.make('doc', err), result);
        });
    };
    Doc.prototype.update = function (body, callback, tries) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.getId()) {
            callback(err_1.default.missingId('doc'));
            return;
        }
        tries++;
        this._performUpdate(body, function (err, result) {
            if (err) {
                if (tries <= _this.db.maxTries && err.name == "conflict") {
                    _this.read(function (err) {
                        if (err)
                            callback(err);
                        else
                            _this.update(body, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else {
                _this.body = _this._extendBody(body);
                _this.body['_rev'] = result['rev'];
                callback(); // success
            }
        });
    };
    Doc.prototype._performUpdate = function (body, callback) {
        this.db.raw.insert(this._extendBody(body), function (err, result) {
            callback(err_1.default.make('doc', err), result);
        });
    };
    Doc.prototype._extendBody = function (body) {
        return deepExtend({}, this.body, body);
    };
    Doc.prototype.destroy = function (callback, tries) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.getId()) {
            callback(err_1.default.missingId('doc'));
            return;
        }
        tries++;
        this._performDestroy(function (err) {
            if (err) {
                if (tries <= _this.db.maxTries && err.name == "conflict") {
                    _this.read(function (err) {
                        if (err)
                            callback(err);
                        else
                            _this.destroy(callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else {
                _this.body = {};
                callback(); // success
            }
        });
    };
    Doc.prototype._performDestroy = function (callback) {
        this.db.raw.destroy(this.getId(), this.getRev(), function (err) {
            callback(err_1.default.make('doc', err));
        });
    };
    return Doc;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Doc;
