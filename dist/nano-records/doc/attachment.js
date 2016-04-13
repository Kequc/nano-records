var DocAttachment = (function () {
    function DocAttachment(doc) {
        this.doc = doc;
    }
    DocAttachment.prototype.exists = function (name) {
        return !!(this.doc.body['_attachments'] && this.doc.body['_attachments'][name]);
    };
    DocAttachment.prototype.get = function (name, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!this.doc.getId()) {
            callback(new Error('Document does not exist.'));
            return;
        }
        this._performGet(name, function (err, result) {
            // NOTE: This is probably unnecessarily verbose
            if (err)
                callback(err);
            else
                callback(null, result); // attachment found!
        });
    };
    DocAttachment.prototype._performGet = function (name, callback) {
        return this.doc.db.raw.attachment.get(this.doc.getId(), name, {}, callback);
    };
    DocAttachment.prototype.add = function (name, data, mimeType, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.doc.getId()) {
            callback(new Error('Document does not exist.'));
            return;
        }
        tries++;
        this._performAdd(name, data, mimeType, function (err, result) {
            if (err) {
                if (tries <= this.doc.db.maxTries) {
                    this.doc.retrieveLatest(function (err) {
                        if (err)
                            callback(err);
                        else
                            this.add(name, data, mimeType, callback, tries);
                    }.bind(this));
                }
                else
                    callback(err);
            }
            else {
                // attachment added
                // TODO: Is there more information available here?
                this.doc.body['_attachments'] = this.doc.body['_attachments'] || {};
                this.doc.body['_attachments'][name] = {};
                this.doc.body['_rev'] = result['rev'];
                callback(null);
            }
        }.bind(this));
    };
    DocAttachment.prototype.stream = function (name, mimetype, callback) {
        if (callback === void 0) { callback = function () { }; }
        return this._performAdd(name, null, mimetype, function (err, result) {
            if (err)
                callback(err);
            else {
                // attachment streamed
                // TODO: Is there more information available here?
                this.doc.body['_attachments'] = this.doc.body['_attachments'] || {};
                this.doc.body['_attachments'][name] = {};
                this.doc.body['_rev'] = result['rev'];
                callback(null);
            }
        }.bind(this));
    };
    DocAttachment.prototype._performAdd = function (name, data, mimeType, callback) {
        return this.doc.db.raw.attachment.insert(this.doc.getId(), name, data, mimeType, { rev: this.doc.getRev() }, callback);
    };
    DocAttachment.prototype.destroy = function (name, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.doc.getId()) {
            callback(new Error('Document does not exist.'));
            return;
        }
        tries++;
        this._performDestroy(name, function (err, result) {
            if (err) {
                if (tries <= this.doc.db.maxTries) {
                    this.doc.retrieveLatest(function (err) {
                        if (err)
                            callback(err);
                        else
                            this.destroy(name, callback, tries);
                    }.bind(this));
                }
                else
                    callback(err);
            }
            else {
                // attachment removed
                if (this.doc.body['_attachments'])
                    delete this.doc.body['_attachments'][name];
                this.doc.body['_rev'] = result['rev'];
                callback(null);
            }
        }.bind(this));
    };
    DocAttachment.prototype._performDestroy = function (name, callback) {
        return this.doc.db.raw.attachment.destroy(this.doc.getId(), name, { rev: this.doc.getRev() }, callback);
    };
    return DocAttachment;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DocAttachment;
