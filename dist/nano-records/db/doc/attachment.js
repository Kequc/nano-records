var DbDocAttachment = (function () {
    function DbDocAttachment(doc) {
        this.doc = doc;
    }
    DbDocAttachment.prototype.persist = function (id, name, data, mimeType, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.doc.get(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.attachment.persist(name, data, mimeType, callback); // attempt attachment
        });
    };
    DbDocAttachment.prototype.get = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        // doesn't need _rev
        // so we can skip doc.get
        this._performGet(id, name, function (err, data) {
            // NOTE: This is probably unnecessarily verbose
            if (err)
                callback(err);
            else
                callback(null, data); // attachment found!
        });
    };
    DbDocAttachment.prototype.read = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        return this._performGet(id, name, function (err) {
            // NOTE: Yeah yeah this is maybe too verbose too
            // FIXME: This doesn't actually return an error if the document doesn't exist
            if (err)
                callback(err);
            else
                callback(null); // found it!
        });
    };
    DbDocAttachment.prototype._performGet = function (id, name, callback) {
        return this.doc.db.raw.attachment.get(id, name, {}, callback);
    };
    DbDocAttachment.prototype.erase = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.doc.get(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.attachment.erase(name, callback); // attempt erase
        });
    };
    return DbDocAttachment;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DbDocAttachment;
