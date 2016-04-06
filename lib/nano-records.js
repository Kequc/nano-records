var _ = require('lodash');
var maxTries = 5;
var NanoRecord = (function () {
    function NanoRecord(parent, data) {
        if (data === void 0) { data = {}; }
        this.attachment = {
            find: this._attachmentFind,
            add: this._attachmentAdd,
            stream: this._attachmentStream,
            destroy: this._attachmentDestroy
        };
        this._parent = parent;
        this.data = data;
    }
    NanoRecord.prototype._attachmentFind = function (name, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!this.data['_id']) {
            callback(new Error('Document does not exist.'));
            return;
        }
        this._performAttachmentFind(name, function (err, body) {
            if (err)
                callback(err);
            else
                callback(null, body); // attachment found!
        });
    };
    NanoRecord.prototype._performAttachmentFind = function (name, callback) {
        return this._parent.db.attachment.get(this.data['_id'], name, {}, callback);
    };
    NanoRecord.prototype._attachmentAdd = function (name, data, mimeType, callback, tries) {
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
                            this._attachmentAdd(name, data, mimeType, callback, tries);
                    }.bind(this));
                }
                else
                    callback(err);
            }
            else
                callback(null, true); // attachment added
        }.bind(this));
    };
    NanoRecord.prototype._attachmentStream = function (name, mimetype, callback) {
        if (callback === void 0) { callback = function () { }; }
        return this._performAttachmentAdd(name, null, mimetype, function (err) {
            if (err)
                callback(err);
            else
                callback(null, true); // attachment streamed
        });
    };
    NanoRecord.prototype._performAttachmentAdd = function (name, data, mimeType, callback) {
        return this._parent.db.attachment.insert(this.data['_id'], name, data, mimeType, { rev: this.data['_rev'] }, callback);
    };
    NanoRecord.prototype._attachmentDestroy = function (name, callback, tries) {
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
                            this._attachmentDestroy(name, callback, tries);
                    }.bind(this));
                }
                else
                    callback(err);
            }
            else
                callback(null, true); // attachment removed
        }.bind(this));
    };
    NanoRecord.prototype._performAttachmentDestroy = function (name, callback) {
        return this._parent.db.attachment.destroy(this.data['_id'], name, { rev: this.data['_rev'] }, callback);
    };
    NanoRecord.prototype.retrieveLatest = function (callback) {
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
    NanoRecord.prototype._performRetrieveLatest = function (callback) {
        return this._parent.db.get(this.data['_id'], callback);
    };
    NanoRecord.prototype.update = function (data, callback, tries) {
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
    NanoRecord.prototype._performUpdate = function (data, callback) {
        return this._parent.db.insert(_.extend({}, this.data, data), callback);
    };
    NanoRecord.prototype.destroy = function (callback, tries) {
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
    NanoRecord.prototype._performDestroy = function (callback) {
        return this._parent.db.destroy(this.data['_id'], this.data['_rev'], callback);
    };
    return NanoRecord;
}());
var NanoRecords = (function () {
    function NanoRecords(nano, dbName, views) {
        this.nano = nano;
        this.dbName = dbName;
        this.views = views || {};
        this.db = this.nano.use(this.dbName);
    }
    NanoRecords.prototype.create = function (data, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        tries++;
        this.db.insert(data, function (err, body) {
            if (err) {
                if (tries <= 1 && err.message === 'no_db_file') {
                    // create db
                    this.nano.db.create(this.dbName, function () {
                        this.create(data, callback, tries);
                    }.bind(this));
                }
                else
                    callback(err);
            }
            else
                callback(null, new NanoRecord(this, body)); // created successfully
        }.bind(this));
    };
    NanoRecords.prototype.find = function (id, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.db.get(id, function (err, body) {
            if (err)
                callback(err);
            else
                callback(null, new NanoRecord(this, body)); // document found!
        }.bind(this));
    };
    NanoRecords.prototype.update = function (id, data, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.find(id, function (err, instance) {
            if (err)
                callback(err);
            else
                instance.update(data, callback); // attempt update
        });
    };
    NanoRecords.prototype.destroy = function (id, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.find(id, function (err, instance) {
            if (err)
                callback(err);
            else
                instance.destroy(callback); // attempt destroy
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
                        // create design document with requested view
                        var designDoc = { _id: '_design/' + this.dbName, views: {} };
                        designDoc.views[name] = this.views[name];
                        this.create(designDoc, function (err) {
                            if (err)
                                callback(err);
                            else
                                this.view(name, data, callback, tries);
                        }.bind(this));
                    }
                    else if (err.message === 'missing_named_view') {
                        // add view to design document
                        var designViews = {};
                        designViews[name] = this.views[name];
                        this.update('_design/' + this.dbName, { views: designViews }, function (err) {
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
