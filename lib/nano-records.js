var _ = require('lodash');
var NanoRecord = (function () {
    function NanoRecord(parent, data) {
        if (data === void 0) { data = {}; }
        this._parent = parent;
        this.data = data;
    }
    NanoRecord.prototype.attachmentGet = function (name, callback) {
        if (callback === void 0) { callback = function () { }; }
        this._parent.db.attachment.get(this.data['_id'], name, {}, function (err, body) {
            if (err)
                callback(err);
            else
                callback(null, body);
        });
    };
    NanoRecord.prototype.attachmentAdd = function (name, data, mimeType, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        tries++;
        var next = function () {
            this._parent.db.attachment.insert(this.data['_id'], name, data, mimeType, { rev: this.data['_rev'] }, function (err, body) {
                if (err) {
                    if (tries <= 3)
                        this.attach(name, data, mimeType, callback, tries);
                    else
                        callback(err);
                }
                else
                    callback(null, this);
            }.bind(this));
        };
        if (data || data == 0) {
            // not an attempt to stream
            this.fetch(function (err) {
                if (err)
                    callback(err);
                else
                    next();
            });
        }
        else
            return next();
    };
    NanoRecord.prototype.attachmentRemove = function (name, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.fetch(function (err) {
            if (err)
                callback(err);
            else {
                this._parent.db.attachment.destroy(this.data['_id'], name, { rev: this.data['_rev'] }, function (err) {
                    if (err)
                        callback(err);
                    else
                        callback(null, this);
                });
            }
        }.bind(this));
    };
    NanoRecord.prototype.fetch = function (callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!this.data['_id']) {
            callback(new Error('Document does not exist.'));
            return;
        }
        this._parent.db.get(this.data['_id'], function (err, body) {
            if (err)
                callback(err);
            else {
                this.data = body;
                callback(null, this);
            }
        }.bind(this));
    };
    NanoRecord.prototype.update = function (data, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.data['_id']) {
            callback(new Error('Document does not exist.'));
            return;
        }
        tries++;
        this.fetch(function (err) {
            if (err)
                callback(err);
            else {
                var newData = _.extend({}, this.data, data);
                this._parent.db.insert(newData, function (err, body) {
                    if (err) {
                        if (tries <= 3)
                            this.update(data, callback, tries);
                        else
                            callback(err);
                    }
                    else
                        callback(null, this);
                }.bind(this));
            }
        }.bind(this));
    };
    NanoRecord.prototype.destroy = function (callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!this.data['_id']) {
            callback(new Error('Document does not exist.'));
            return;
        }
        tries++;
        this.fetch(function (err) {
            if (err)
                callback(err);
            else {
                this._parent.db.destroy(this.data['_id'], this.data['_rev'], function (err) {
                    if (err)
                        callback(err);
                    else {
                        this.data = {};
                        callback();
                    }
                }.bind(this));
            }
        }.bind(this));
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
                if (tries <= 3 && err.message === 'no_db_file') {
                    // create db
                    this.nano.db.create(this.dbName, function () {
                        this.create(data, callback, tries);
                    }.bind(this));
                }
                else
                    callback(err);
            }
            else
                callback(null, new NanoRecord(this, body));
        }.bind(this));
    };
    NanoRecords.prototype.update = function (id, data, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.find(id, function (err, instance) {
            if (err)
                callback(err);
            else
                instance.update(data, callback);
        });
    };
    NanoRecords.prototype.find = function (id, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.db.get(id, function (err, body) {
            if (err)
                callback(err);
            else
                callback(null, new NanoRecord(this, body));
        }.bind(this));
    };
    NanoRecords.prototype.view = function (name, data, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        tries++;
        this.db.view(this.dbName, name, data, function (err, body) {
            if (err) {
                if (tries <= 4) {
                    if (err.message === 'missing' || err.message === 'deleted') {
                        // create design document
                        var designDoc = { _id: '_design/' + this.dbName, views: {} };
                        designDoc.views[name] = this._views[name];
                        this.create(designDoc, function (err) {
                            if (err)
                                callback(err);
                            else
                                this.view(name, data, callback, tries);
                        }.bind(this));
                    }
                    else if (err.message === 'missing_named_view') {
                        // add view to design document
                        var views = {};
                        views[name] = this._views[name];
                        this.update('_design/' + this.dbName, { views: views }, function (err) {
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
                callback(null, body);
        }.bind(this));
    };
    return NanoRecords;
}());
module.exports = NanoRecords;
