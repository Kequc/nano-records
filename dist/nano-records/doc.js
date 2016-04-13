var attachment_1 = require('./doc/attachment');
var deepExtend = require('deep-extend');
var Doc = (function () {
    function Doc(db, body) {
        if (body === void 0) { body = {}; }
        this.db = db;
        this.body = body;
        this.attachment = new attachment_1.default(this);
    }
    Doc.prototype.getId = function () {
        return this.body['_id'] || null;
    };
    Doc.prototype.getRev = function () {
        return this.body['_rev'] || null;
    };
    Doc.prototype.retrieveLatest = function (callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!this.getId()) {
            callback(new Error('Document does not exist.'));
            return;
        }
        this._performRetrieveLatest(function (err, result) {
            if (err)
                callback(err);
            else {
                this.body = result;
                callback(null); // up to date
            }
        }.bind(this));
    };
    Doc.prototype._performRetrieveLatest = function (callback) {
        return this.db.raw.get(this.getId(), callback);
    };
    Doc.prototype.update = function (body, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.getId()) {
            callback(new Error('Document does not exist.'));
            return;
        }
        tries++;
        this._performUpdate(body, function (err, result) {
            if (err) {
                if (tries <= this.db.maxTries) {
                    this.retrieveLatest(function (err) {
                        if (err)
                            callback(err);
                        else
                            this.update(body, callback, tries);
                    }.bind(this));
                }
                else
                    callback(err);
            }
            else {
                this.body = this._extendBody(body);
                this.body['_rev'] = result['rev'];
                callback(null); // success
            }
        }.bind(this));
    };
    Doc.prototype._performUpdate = function (body, callback) {
        return this.db.raw.insert(this._extendBody(body), callback);
    };
    Doc.prototype._extendBody = function (body) {
        return deepExtend({}, this.body, body);
    };
    Doc.prototype.destroy = function (callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.getId()) {
            callback(new Error('Document does not exist.'));
            return;
        }
        tries++;
        this._performDestroy(function (err) {
            if (err) {
                if (tries <= this.db.maxTries) {
                    this.retrieveLatest(function (err) {
                        if (err)
                            callback(err);
                        else
                            this.destroy(callback, tries);
                    }.bind(this));
                }
                else
                    callback(err);
            }
            else {
                this.body = {};
                callback(null); // success
            }
        }.bind(this));
    };
    Doc.prototype._performDestroy = function (callback) {
        return this.db.raw.destroy(this.getId(), this.getRev(), callback);
    };
    return Doc;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Doc;
