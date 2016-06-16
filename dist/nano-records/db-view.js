/* class DbView
 *
 * Responsible for manipulation and execution of CouchDB design
 * document views. Will generally persist and update design documents
 * in the database and returns List objects resulting from design
 * queries.
 *
 */
"use strict";
var err_1 = require('./err');
var list_1 = require('./list');
var db_view_builder_1 = require('./db-view-builder');
var _ = require('underscore');
var DbView = (function () {
    function DbView(db) {
        this.db = db;
    }
    DbView.prototype.only = function (keys, values, params, callback) {
        // generated views consisiting of provided keys and values
        if (!keys)
            callback(err_1.default.missingParam('view', "keys"));
        else if (!values)
            callback(err_1.default.missingParam('view', "values"));
        else if (!params)
            callback(err_1.default.missingParam('view', "params"));
        else
            this._only(keys, values, params, callback);
    };
    DbView.prototype.all = function (keys, params, callback) {
        // generated views consisiting of provided keys and full documents
        if (!keys)
            callback(err_1.default.missingParam('view', "keys"));
        else if (!params)
            callback(err_1.default.missingParam('view', "params"));
        else {
            var extended = { include_docs: true };
            this._only(keys, undefined, _.extend({}, params, extended), callback);
        }
    };
    DbView.prototype._only = function (keys, values, params, callback, tries) {
        var _this = this;
        if (tries === void 0) { tries = 0; }
        tries++;
        var name = db_view_builder_1.DbViewBuilder.generateName(keys, values);
        this._performCatalog("_nano_records", name, params, function (err, result) {
            if (err) {
                if (tries <= 1 && (err.name == "no_db_file" || err.name == "not_found")) {
                    var view = {
                        map: db_view_builder_1.DbViewBuilder.mapFunction(keys, values)
                    };
                    _this._updateNanoRecordsDesign(name, view, function (err) {
                        if (err)
                            callback(err, new list_1.default(_this.db));
                        else
                            _this._only(keys, values, params, callback, tries);
                    });
                }
                else
                    callback(err, new list_1.default(_this.db));
            }
            else
                callback(undefined, new list_1.default(_this.db, result)); // executed successfully
        });
    };
    DbView.prototype._updateNanoRecordsDesign = function (name, view, callback) {
        // generate design view
        var body = { language: "javascript", views: {} };
        body.views[name] = view;
        this.db.doc.updateOrWrite('_design/_nano_records', body, callback);
    };
    // TODO: we need a way to force persist individual views in
    // cases where they have been changed
    DbView.prototype.catalog = function (design, name, params, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (!design)
            callback(err_1.default.missingParam('view', "design"));
        else if (!name)
            callback(err_1.default.missingParam('view', "name"));
        else if (!params)
            callback(err_1.default.missingParam('view', "params"));
        else
            this._catalog(design, name, params, callback);
    };
    DbView.prototype._catalog = function (design, name, params, callback, tries) {
        var _this = this;
        if (tries === void 0) { tries = 0; }
        tries++;
        this._performCatalog(design, name, params, function (err, result) {
            if (err) {
                if (tries <= 1 && (err.name == "no_db_file" || err.name == "not_found")) {
                    _this._updateDesign(design, [name], function (err) {
                        if (err)
                            callback(err, new list_1.default(_this.db));
                        else
                            _this._catalog(design, name, params, callback, tries);
                    });
                }
                else
                    callback(err, new list_1.default(_this.db));
            }
            else
                callback(undefined, new list_1.default(_this.db, result)); // executed successfully
        });
    };
    DbView.prototype._performCatalog = function (design, name, params, callback) {
        this.db.raw.view(design, name, params, err_1.default.resultFunc('view', callback));
    };
    DbView.prototype._updateDesign = function (designId, names, callback) {
        var design = this.db.designs[designId];
        if (!design) {
            callback(new err_1.default('view', "not_defined", "No design specified for: " + designId));
            return;
        }
        // generate design document
        var body = { language: design.language, views: {} };
        for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
            var name_1 = names_1[_i];
            if (design.views[name_1])
                body.views[name_1] = design.views[name_1];
            else {
                callback(new err_1.default('view', "missing_view", "Missing deinition for: " + name_1));
                return;
            }
        }
        // update design
        this.db.doc.updateOrWrite('_design/' + designId, body, callback);
    };
    return DbView;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DbView;
