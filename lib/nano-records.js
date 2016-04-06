/// <reference path="../typings/main.d.ts" />
var _ = require('lodash');
var maxTries = 5;
var NanoRecords_Document = (function () {
    function NanoRecords_Document(parent, data) {
        if (data === void 0) { data = {}; }
        this.attachment = {
            find: this.attachmentFind,
            add: this.attachmentAdd,
            stream: this.attachmentStream,
            destroy: this.attachmentDestroy
        };
        this._parent = parent;
        this.data = data;
    }
    NanoRecords_Document.prototype.attachmentFind = function (name, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!this.data['_id']) {
            callback(new Error('Document does not exist.'));
            return;
        }
        this._performAttachmentFind(name, function (err, body) {
            // NOTE: This is probably unnecessarily verbose
            if (err)
                callback(err);
            else
                callback(null, body); // attachment found!
        });
    };
    NanoRecords_Document.prototype._performAttachmentFind = function (name, callback) {
        return this._parent.db.attachment.get(this.data['_id'], name, {}, callback);
    };
    NanoRecords_Document.prototype.attachmentAdd = function (name, data, mimeType, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.data['_id']) {
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
        return this._parent.db.attachment.insert(this.data['_id'], name, data, mimeType, { rev: this.data['_rev'] }, callback);
    };
    NanoRecords_Document.prototype.attachmentDestroy = function (name, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.data['_id']) {
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
        return this._parent.db.attachment.destroy(this.data['_id'], name, { rev: this.data['_rev'] }, callback);
    };
    NanoRecords_Document.prototype.retrieveLatest = function (callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!this.data['_id']) {
            callback(new Error('Document does not exist.'));
            return;
        }
        this._performRetrieveLatest(function (err, body) {
            if (err)
                callback(err);
            else {
                this.data = body;
                callback(null, true); // up to date
            }
        }.bind(this));
    };
    NanoRecords_Document.prototype._performRetrieveLatest = function (callback) {
        return this._parent.db.get(this.data['_id'], callback);
    };
    NanoRecords_Document.prototype.update = function (data, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.data['_id']) {
            callback(new Error('Document does not exist.'));
            return;
        }
        tries++;
        this._performUpdate(data, function (err, body) {
            if (err) {
                if (tries <= maxTries) {
                    this.retrieveLatest(function (err) {
                        if (err)
                            callback(err);
                        else
                            this.update(data, callback, tries);
                    }.bind(this));
                }
                else
                    callback(err);
            }
            else {
                this.data = body;
                callback(null, true); // success
            }
        }.bind(this));
    };
    NanoRecords_Document.prototype._performUpdate = function (data, callback) {
        return this._parent.db.insert(_.extend({}, this.data, data), callback);
    };
    NanoRecords_Document.prototype.destroy = function (callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.data['_id']) {
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
            else
                callback(null, true); // success
        }.bind(this));
    };
    NanoRecords_Document.prototype._performDestroy = function (callback) {
        return this._parent.db.destroy(this.data['_id'], this.data['_rev'], callback);
    };
    return NanoRecords_Document;
}());
var NanoRecords = (function () {
    function NanoRecords(nano, dbName, views) {
        this.doc = {
            create: this.docCreate,
            find: this.docFind,
            update: this.docUpdate,
            destroy: this.docDestroy
        };
        this.nano = nano;
        this.dbName = dbName;
        this.views = views || {};
        this.db = this.nano.use(this.dbName);
    }
    NanoRecords.prototype.docCreate = function (data, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        tries++;
        this.db.insert(data, function (err, body) {
            if (err) {
                if (tries <= 1 && err.message === 'no_db_file') {
                    // create db
                    this.nano.db.create(this.dbName, function (err) {
                        if (err)
                            callback(err);
                        else
                            this.docCreate(data, callback, tries);
                    }.bind(this));
                }
                else
                    callback(err);
            }
            else
                callback(null, new NanoRecords_Document(this, body)); // created successfully
        }.bind(this));
    };
    NanoRecords.prototype.docFind = function (id, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.db.get(id, function (err, body) {
            if (err)
                callback(err);
            else
                callback(null, new NanoRecords_Document(this, body)); // document found!
        }.bind(this));
    };
    NanoRecords.prototype.docUpdate = function (id, data, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.docFind(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.update(data, callback); // attempt update
        });
    };
    NanoRecords.prototype.docDestroy = function (id, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.docFind(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.destroy(callback); // attempt destroy
        });
    };
    NanoRecords.prototype.view = function (name, data, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        tries++;
        this.db.view(this.dbName, name, data, function (err, body) {
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
                                this.view(name, data, callback, tries);
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
                                this.view(name, data, callback, tries);
                        }.bind(this));
                    }
                    else
                        callback(err);
                }
                else
                    callback(err);
            }
            else
                callback(null, body); // executed successfully
        }.bind(this));
    };
    return NanoRecords;
}());
module.exports = NanoRecords;
