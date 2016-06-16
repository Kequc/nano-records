/* class DbShow
 *
 * Responsible for manipulation and execution of CouchDB design
 * document shows. Will generally persist and update design documents
 * in the database and returns raw data resulting from design
 * queries.
 *
 */
"use strict";
var err_1 = require('./err');
var DbDesign = (function () {
    function DbDesign(db) {
        this.db = db;
    }
    // TODO: we need a way to force persist individual shows in
    // cases where they have been changed
    DbDesign.prototype.catalog = function (id, design, name, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id)
            callback(err_1.default.missingId('show'));
        else if (!design)
            callback(err_1.default.missingParam('show', "design"));
        else if (!name)
            callback(err_1.default.missingParam('show', "name"));
        else
            this._catalog(id, design, name, callback);
    };
    DbDesign.prototype._catalog = function (id, design, name, callback, tries) {
        var _this = this;
        if (tries === void 0) { tries = 0; }
        tries++;
        this._performCatalog(id, design, name, function (err, result) {
            if (err) {
                if (tries <= 1 && (err.name == "no_db_file" || err.name == "not_found")) {
                    _this._updateDesign(design, [name], function (err) {
                        if (err)
                            callback(err);
                        else
                            _this._catalog(id, design, name, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else
                callback(undefined, result); // executed successfully
        });
    };
    DbDesign.prototype._performCatalog = function (id, design, name, callback) {
        this.db.raw.show(design, name, id, err_1.default.resultFunc('design', callback));
    };
    DbDesign.prototype._updateDesign = function (designId, names, callback) {
        var design = this.db.designs[designId];
        if (!design) {
            callback(new err_1.default('show', "not_defined", "No design specified for: " + designId));
            return;
        }
        // generate design document
        var body = { language: design.language, shows: {} };
        for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
            var name_1 = names_1[_i];
            if (design.shows[name_1])
                body.shows[name_1] = design.shows[name_1];
            else {
                callback(new err_1.default('show', "missing_show", "Missing deinition for: " + name_1));
                return;
            }
        }
        // update design
        this.db.doc.updateOrWrite('_design/' + designId, body, callback);
    };
    return DbDesign;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DbDesign;
