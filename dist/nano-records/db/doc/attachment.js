var DbDocAttachment = (function () {
    function DbDocAttachment(doc) {
        this.doc = doc;
    }
    DbDocAttachment.prototype.add = function (id, name, data, mimeType, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.doc.get(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.attachment.add(name, data, mimeType, callback); // attempt attachment
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
            callback(err || null);
        });
    };
    DbDocAttachment.prototype._performGet = function (id, name, callback) {
        return this.doc.db.raw.attachment.get(id, name, {}, callback);
    };
    DbDocAttachment.prototype.destroy = function (id, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        this.doc.get(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.attachment.destroy(name, callback); // attempt destroy
        });
    };
    return DbDocAttachment;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DbDocAttachment;
