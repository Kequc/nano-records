/// <reference path="../typings/main.d.ts" />
var deepExtend = require('deep-extend');
var maxTries = 5;
var NanoRecords_Document = (function () {
    function NanoRecords_Document(parent, body) {
        if (body === void 0) { body = {}; }
        this.attachment = {
            get: this.attachmentGet.bind(this),
            add: this.attachmentAdd.bind(this),
            stream: this.attachmentStream.bind(this),
            destroy: this.attachmentDestroy.bind(this)
        };
        this._parent = parent;
        this.body = body;
    }
    NanoRecords_Document.prototype.attachmentGet = function (name, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!this.body['_id']) {
            callback(new Error('Document does not exist.'));
            return;
        }
        this._performAttachmentGet(name, function (err, result) {
            // NOTE: This is probably unnecessarily verbose
            if (err)
                callback(err);
            else
                callback(null, result); // attachment found!
        });
    };
    NanoRecords_Document.prototype._performAttachmentGet = function (name, callback) {
        return this._parent.db.attachment.get(this.body['_id'], name, {}, callback);
    };
    NanoRecords_Document.prototype.attachmentAdd = function (name, data, mimeType, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.body['_id']) {
            callback(new Error('Document does not exist.'));
            return;
        }
        tries++;
        this._performAttachmentAdd(name, data, mimeType, function (err) {
            if (err) {
                if (tries <= maxTries) {
                    this.retrieveLatest(function (err) {
                        if (err)
                            callback(err);
                        else
                            this.attachmentAdd(name, data, mimeType, callback, tries);
                    }.bind(this));
                }
                else
                    callback(err);
            }
            else
                callback(null, true); // attachment added
        }.bind(this));
    };
    NanoRecords_Document.prototype.attachmentStream = function (name, mimetype, callback) {
        if (callback === void 0) { callback = function () { }; }
        return this._performAttachmentAdd(name, null, mimetype, function (err) {
            if (err)
                callback(err);
            else
                callback(null, true); // attachment streamed
        });
    };
    NanoRecords_Document.prototype._performAttachmentAdd = function (name, data, mimeType, callback) {
        return this._parent.db.attachment.insert(this.body['_id'], name, data, mimeType, { rev: this.body['_rev'] }, callback);
    };
    NanoRecords_Document.prototype.attachmentDestroy = function (name, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.body['_id']) {
            callback(new Error('Document does not exist.'));
            return;
        }
        tries++;
        this._performAttachmentDestroy(name, function (err) {
            if (err) {
                if (tries <= maxTries) {
                    this.retrieveLatest(function (err) {
                        if (err)
                            callback(err);
                        else
                            this.attachmentDestroy(name, callback, tries);
                    }.bind(this));
                }
                else
                    callback(err);
            }
            else
                callback(null, true); // attachment removed
        }.bind(this));
    };
    NanoRecords_Document.prototype._performAttachmentDestroy = function (name, callback) {
        return this._parent.db.attachment.destroy(this.body['_id'], name, { rev: this.body['_rev'] }, callback);
    };
    NanoRecords_Document.prototype.retrieveLatest = function (callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!this.body['_id']) {
            callback(new Error('Document does not exist.'));
            return;
        }
        this._performRetrieveLatest(function (err, result) {
            if (err)
                callback(err);
            else {
                this.body = result;
                callback(null, true); // up to date
            }
        }.bind(this));
    };
    NanoRecords_Document.prototype._performRetrieveLatest = function (callback) {
        return this._parent.db.get(this.body['_id'], callback);
    };
    NanoRecords_Document.prototype.update = function (body, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.body['_id']) {
            callback(new Error('Document does not exist.'));
            return;
        }
        tries++;
        this._performUpdate(body, function (err, result) {
            if (err) {
                if (tries <= maxTries) {
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
                this.body = this._extendData(body);
                this.body['_rev'] = result['rev'];
                callback(null, true); // success
            }
        }.bind(this));
    };
    NanoRecords_Document.prototype._performUpdate = function (body, callback) {
        return this._parent.db.insert(this._extendData(body), callback);
    };
    NanoRecords_Document.prototype._extendData = function (body) {
        return deepExtend({}, this.body, body);
    };
    NanoRecords_Document.prototype.destroy = function (callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.body['_id']) {
            callback(new Error('Document does not exist.'));
            return;
        }
        tries++;
        this._performDestroy(function (err) {
            if (err) {
                if (tries <= maxTries) {
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
                callback(null, true); // success
            }
        }.bind(this));
    };
    NanoRecords_Document.prototype._performDestroy = function (callback) {
        return this._parent.db.destroy(this.body['_id'], this.body['_rev'], callback);
    };
    return NanoRecords_Document;
}());
var NanoRecords = (function () {
    function NanoRecords(nano, dbName, views) {
        this.doc = {
            create: this.docCreate.bind(this),
            get: this.docGet.bind(this),
            update: this.docUpdate.bind(this),
            destroy: this.docDestroy.bind(this),
            attachment: {
                add: this.docAttachmentAdd.bind(this),
                get: this.docAttachmentGet.bind(this),
                destroy: this.docAttachmentDestroy.bind(this)
            }
        };
        this.nano = nano;
        this.dbName = dbName;
        this.views = views || {};
        this.db = this.nano.use(this.dbName);
    }
    NanoRecords.prototype.docAttachmentAdd = function (id, name, data, mimeType, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.docGet(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.attachmentAdd(name, data, mimeType, callback); // attempt attachment
        });
    };
    NanoRecords.prototype.docAttachmentGet = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.docGet(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.attachmentGet(name, callback); // attempt get
        });
    };
    NanoRecords.prototype.docAttachmentDestroy = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.docGet(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.attachmentDestroy(name, callback); // attempt destroy
        });
    };
    NanoRecords.prototype.docCreate = function (body, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        tries++;
        this.db.insert(body, function (err, result) {
            if (err) {
                if (tries <= 1 && err.message === 'no_db_file') {
                    // create db
                    this.nano.db.create(this.dbName, function (err) {
                        if (err)
                            callback(err);
                        else
                            this.docCreate(body, callback, tries);
                    }.bind(this));
                }
                else
                    callback(err);
            }
            else {
                body['_id'] = result['id'];
                body['_rev'] = result['rev'];
                callback(null, new NanoRecords_Document(this, body)); // created successfully
            }
        }.bind(this));
    };
    NanoRecords.prototype.docGet = function (id, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.db.get(id, function (err, result) {
            if (err)
                callback(err);
            else
                callback(null, new NanoRecords_Document(this, result)); // document found!
        }.bind(this));
    };
    NanoRecords.prototype.docUpdate = function (id, body, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.docGet(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.update(body, callback); // attempt update
        });
    };
    NanoRecords.prototype.docDestroy = function (id, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.docGet(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.destroy(callback); // attempt destroy
        });
    };
    NanoRecords.prototype.view = function (name, params, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        tries++;
        this.db.view(this.dbName, name, params, function (err, result) {
            if (err) {
                if (tries <= 1) {
                    if (err.message === 'missing' || err.message === 'deleted') {
                        // create design document
                        var designData = { _id: '_design/' + this.dbName, views: {} };
                        designData.views[name] = this.views[name];
                        this.docCreate(designData, function (err) {
                            if (err)
                                callback(err);
                            else
                                this.view(name, params, callback, tries);
                        }.bind(this));
                    }
                    else if (err.message === 'missing_named_view') {
                        // add view
                        var viewData = {};
                        viewData[name] = this.views[name];
                        this.docUpdate('_design/' + this.dbName, { views: viewData }, function (err) {
                            if (err)
                                callback(err);
                            else
                                this.view(name, params, callback, tries);
                        }.bind(this));
                    }
                    else
                        callback(err);
                }
                else
                    callback(err);
            }
            else
                callback(null, result); // executed successfully
        }.bind(this));
    };
    return NanoRecords;
}());
module.exports = NanoRecords;
