/* class DbDesign
 *
 * Responsible for manipulation and execution of CouchDB design
 * documents. Will generally persist and update design documents
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
    // TODO: we need a way to force persist individual views and shows
    // in cases where they have been changed
    // TODO: we probably need a separate interface for interacting with
    // the results from this class
    DbDesign.prototype.show = function (id, name, docId, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id)
            callback(err_1.default.missingId('design'));
        else
            this._show(id, name, docId, callback);
    };
    DbDesign.prototype._show = function (id, name, docId, callback, tries) {
        var _this = this;
        if (tries === void 0) { tries = 0; }
        tries++;
        this._performShow(id, name, docId, function (err, result) {
            if (err) {
                if (tries <= 1 && (err.name == "no_db_file" || err.name == "not_found")) {
                    _this._updateDesign(id, { 'shows': [name] }, function (err) {
                        if (err)
                            callback(err);
                        else
                            _this._show(id, name, docId, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else
                callback(undefined, result); // executed successfully
        });
    };
    DbDesign.prototype._performShow = function (id, name, docId, callback) {
        this.db.raw.show(id, name, docId, err_1.default.resultFunc('design', callback));
    };
    DbDesign.prototype.view = function (id, name, params, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!id)
            callback(err_1.default.missingId('doc'));
        else
            this._view(id, name, params, callback);
    };
    DbDesign.prototype._view = function (id, name, params, callback, tries) {
        var _this = this;
        if (tries === void 0) { tries = 0; }
        tries++;
        this._performView(id, name, params, function (err, result) {
            if (err) {
                if (tries <= 1 && (err.name == "no_db_file" || err.name == "not_found")) {
                    _this._updateDesign(id, { 'views': [name] }, function (err) {
                        if (err)
                            callback(err);
                        else
                            _this._view(id, name, params, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else
                callback(undefined, result); // executed successfully
        });
    };
    DbDesign.prototype._performView = function (id, name, params, callback) {
        this.db.raw.view(id, name, params, err_1.default.resultFunc('design', callback));
    };
    DbDesign.prototype._updateDesign = function (id, kinds, callback) {
        var design = this.db.designs[id];
        if (!design) {
            callback(new err_1.default('design', "not_defined", "No design specified for: " + id));
            return;
        }
        // generate design document
        var body = { language: design.language };
        for (var kind in kinds) {
            switch (kind) {
                case 'shows':
                    body.shows = {};
                    for (var _i = 0, _a = kinds[kind]; _i < _a.length; _i++) {
                        var name_1 = _a[_i];
                        if (design.shows[name_1])
                            body.shows[name_1] = design.shows[name_1];
                        else {
                            callback(new err_1.default('design', "missing_show", "Missing deinition for: " + name_1));
                            return;
                        }
                    }
                    break;
                case 'views':
                    body.views = {};
                    for (var _b = 0, _c = kinds[kind]; _b < _c.length; _b++) {
                        var name_2 = _c[_b];
                        if (design.views[name_2])
                            body.views[name_2] = design.views[name_2];
                        else {
                            callback(new err_1.default('design', "missing_view", "Missing deinition for: " + name_2));
                            return;
                        }
                    }
                    break;
            }
        }
        // update design
        this.db.doc.forcedUpdate('_design/' + id, body, callback);
    };
    return DbDesign;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DbDesign;
