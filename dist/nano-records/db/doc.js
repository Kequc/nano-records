var doc_1 = require('../doc');
var attachment_1 = require('./doc/attachment');
var DbDoc = (function () {
    function DbDoc(db) {
        this.db = db;
        this.attachment = new attachment_1.default(this);
    }
    DbDoc.prototype.create = function (body, callback, tries) {
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        tries++;
        this.db.raw.insert(body, function (err, result) {
            if (err) {
                if (tries <= 1 && err.message === 'no_db_file') {
                    // create db
                    this.db.nano.db.create(this.db.dbName, function (err) {
                        if (err)
                            callback(err);
                        else
                            this.create(body, callback, tries);
                    }.bind(this));
                }
                else
                    callback(err);
            }
            else {
                body['_id'] = result['id'];
                body['_rev'] = result['rev'];
                callback(null, new doc_1.default(this.db, body)); // created successfully
            }
        }.bind(this));
    };
    DbDoc.prototype.get = function (id, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.db.raw.get(id, function (err, result) {
            if (err)
                callback(err);
            else
                callback(null, new doc_1.default(this.db, result)); // document found!
        }.bind(this));
    };
    DbDoc.prototype.update = function (id, body, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.get(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.update(body, callback); // attempt update
        });
    };
    DbDoc.prototype.updateOrCreate = function (id, body, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.get(id, function (err, doc) {
            if (err) {
                body['_id'] = id;
                this.create(body, callback); // attempt create
            }
            else
                doc.update(body, function (err) {
                    if (err)
                        callback(err);
                    else
                        callback(null, doc);
                }); // attempt update
        }.bind(this));
    };
    DbDoc.prototype.destroy = function (id, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.get(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.destroy(callback); // attempt destroy
        });
    };
    return DbDoc;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DbDoc;
