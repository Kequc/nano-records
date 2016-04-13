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
        this.doc.get(id, function (err, doc) {
            if (err)
                callback(err);
            else
                doc.attachment.get(name, callback); // attempt attachment get
        });
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
