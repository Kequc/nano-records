var DocAttachment = (function () {
    function DocAttachment(doc) {
        this.doc = doc;
    }
    DocAttachment.prototype.exists = function (name) {
        return !!(this.doc.body['_attachments'] && this.doc.body['_attachments'][name]);
    };
    DocAttachment.prototype.persist = function (name, data, mimeType, callback, tries) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.doc.getId()) {
            callback(new Error('Document does not exist.'));
            return;
        }
        tries++;
        this._performPersist(name, data, mimeType, function (err, result) {
            if (err) {
                if (tries <= _this.doc.db.maxTries && err.statusCode == 409) {
                    _this.doc.retrieveLatest(function (err) {
                        if (err)
                            callback(err);
                        else
                            _this.persist(name, data, mimeType, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else {
                // attachment persisted
                // TODO: Is there more information available here?
                _this.doc.body['_attachments'] = _this.doc.body['_attachments'] || {};
                _this.doc.body['_attachments'][name] = {};
                _this.doc.body['_rev'] = result['rev'];
                callback(null);
            }
        });
    };
    DocAttachment.prototype.write = function (name, mimetype, callback) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        return this._performPersist(name, null, mimetype, function (err, result) {
            if (err)
                callback(err);
            else {
                // attachment persisted
                // TODO: Is there more information available here?
                _this.doc.body['_attachments'] = _this.doc.body['_attachments'] || {};
                _this.doc.body['_attachments'][name] = {};
                _this.doc.body['_rev'] = result['rev'];
                callback(null);
            }
        });
    };
    DocAttachment.prototype._performPersist = function (name, data, mimeType, callback) {
        return this.doc.db.raw.attachment.insert(this.doc.getId(), name, data, mimeType, { rev: this.doc.getRev() }, callback);
    };
    DocAttachment.prototype.get = function (name, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!this.doc.getId()) {
            callback(new Error('Document does not exist.'));
            return;
        }
        // we have a method already available for this on the db object
        this.doc.db.doc.attachment.get(this.doc.getId(), name, callback);
    };
    DocAttachment.prototype.read = function (name, callback) {
        if (callback === void 0) { callback = function () { }; }
        // we have a method already available for this on the db object
        return this.doc.db.doc.attachment.read(this.doc.getId(), name, callback);
    };
    DocAttachment.prototype.erase = function (name, callback, tries) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.doc.getId()) {
            callback(new Error('Document does not exist.'));
            return;
        }
        tries++;
        this._performErase(name, function (err, result) {
            if (err) {
                if (tries <= _this.doc.db.maxTries && err.statusCode == 409) {
                    _this.doc.retrieveLatest(function (err) {
                        if (err)
                            callback(err);
                        else
                            _this.erase(name, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else {
                // attachment removed
                if (_this.doc.body['_attachments'])
                    delete _this.doc.body['_attachments'][name];
                _this.doc.body['_rev'] = result['rev'];
                callback(null);
            }
        });
    };
    DocAttachment.prototype._performErase = function (name, callback) {
        this.doc.db.raw.attachment.destroy(this.doc.getId(), name, { rev: this.doc.getRev() }, callback);
    };
    return DocAttachment;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DocAttachment;
