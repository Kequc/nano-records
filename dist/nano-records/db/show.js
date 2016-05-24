/* class DbShow
 *
 * Responsible for manipulation and execution of CouchDB design
 * document shows. Will generally persist and update design documents
 * in the database and returns raw data resulting from design
 * queries.
 *
 */
"use strict";
var err_1 = require('../err');
var DbDesign = (function () {
    function DbDesign(db) {
        this.db = db;
    }
    // TODO: we need a way to force persist individual shows in
    // cases where they have been changed
    DbDesign.prototype.read = function (id, name, docId, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id)
            callback(err_1.default.missingId('design'));
        else if (!name)
            callback(err_1.default.missingParam('design', "name"));
        else if (!docId)
            callback(err_1.default.missingParam('design', "docId"));
        else
            this._read(id, name, docId, callback);
    };
    DbDesign.prototype._read = function (id, name, docId, callback, tries) {
        var _this = this;
        if (tries === void 0) { tries = 0; }
        tries++;
        this._performRead(id, name, docId, function (err, result) {
            if (err) {
                if (tries <= 1 && (err.name == "no_db_file" || err.name == "not_found")) {
                    _this._updateDesign(id, [name], function (err) {
                        if (err)
                            callback(err);
                        else
                            _this._read(id, name, docId, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else
                callback(undefined, result); // executed successfully
        });
    };
    DbDesign.prototype._performRead = function (id, name, docId, callback) {
        this.db.raw.show(id, name, docId, err_1.default.resultFunc('design', callback));
    };
    DbDesign.prototype._updateDesign = function (id, names, callback) {
        var design = this.db.designs[id];
        if (!design) {
            callback(new err_1.default('design', "not_defined", "No design specified for: " + id));
            return;
        }
        // generate design document
        var body = { language: design.language, shows: {} };
        for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
            var name_1 = names_1[_i];
            if (design.shows[name_1])
                body.shows[name_1] = design.shows[name_1];
            else {
                callback(new err_1.default('design', "missing_show", "Missing deinition for: " + name_1));
                return;
            }
        }
        // update design
        this.db.doc.updateOrWrite('_design/' + id, body, callback);
    };
    return DbDesign;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DbDesign;
