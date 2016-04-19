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
        return this.body['_id'] || null;
    };
    Doc.prototype.getRev = function () {
        return this.body['_rev'] || null;
    };
    Doc.prototype.getBody = function () {
        return deepExtend({}, this.body);
    };
    Doc.prototype.retrieveLatest = function (callback) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (!this.getId()) {
            callback(new Error('Document does not exist.'));
            return;
        }
        this._performRetrieveLatest(function (err, result) {
            if (err)
                callback(err);
            else {
                _this.body = result;
                callback(null); // up to date
            }
        });
    };
    Doc.prototype._performRetrieveLatest = function (callback) {
        this.db.raw.get(this.getId(), callback);
    };
    Doc.prototype.update = function (body, callback, tries) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.getId()) {
            callback(new Error('Document does not exist.'));
            return;
        }
        tries++;
        this._performUpdate(body, function (err, result) {
            if (err) {
                if (tries <= _this.db.maxTries && err.statusCode == 409) {
                    _this.retrieveLatest(function (err) {
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
                callback(null); // success
            }
        });
    };
    Doc.prototype._performUpdate = function (body, callback) {
        this.db.raw.insert(this._extendBody(body), callback);
    };
    Doc.prototype._extendBody = function (body) {
        return deepExtend({}, this.body, body);
    };
    Doc.prototype.erase = function (callback, tries) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.getId()) {
            callback(new Error('Document does not exist.'));
            return;
        }
        tries++;
        this._performErase(function (err) {
            if (err) {
                if (tries <= _this.db.maxTries && err.statusCode == 409) {
                    _this.retrieveLatest(function (err) {
                        if (err)
                            callback(err);
                        else
                            _this.erase(callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else {
                _this.body = {};
                callback(null); // success
            }
        });
    };
    Doc.prototype._performErase = function (callback) {
        this.db.raw.destroy(this.getId(), this.getRev(), callback);
    };
    return Doc;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Doc;
