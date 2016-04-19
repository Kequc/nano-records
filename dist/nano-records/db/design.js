var err_1 = require('../err');
var DbDesign = (function () {
    function DbDesign(db) {
        this.db = db;
    }
    DbDesign.prototype.show = function (designId, showName, id, callback, tries) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!designId) {
            callback(err_1.default.missing('design'));
            return;
        }
        tries++;
        this._performShow(designId, showName, id, function (err, result) {
            if (err) {
                var _afterResolve = function (err) {
                    if (err)
                        callback(err);
                    else
                        _this.show(designId, showName, id, callback, tries);
                };
                if (tries <= 1 && err.name == "no_db_file")
                    _this.db.create(_afterResolve);
                else if (tries <= 2 && err.name == "not_found")
                    _this._persistDesign(designId, { 'shows': [showName] }, _afterResolve);
                else if (tries <= _this.db.maxTries && err.name == "conflict")
                    _this._performRetrieveLatest(designId, _afterResolve);
                else
                    callback(err);
            }
            else
                callback(undefined, result); // executed successfully
        });
    };
    DbDesign.prototype._performShow = function (designId, showName, id, callback) {
        this.db.raw.show(designId, showName, id, function (err, data) {
            callback(err_1.default.make('design', err), data);
        });
    };
    DbDesign.prototype.view = function (designId, viewName, params, callback, tries) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        if (!designId) {
            callback(err_1.default.missing('doc'));
            return;
        }
        tries++;
        this._performView(designId, viewName, params, function (err, result) {
            if (err) {
                var _afterResolve = function (err) {
                    if (err)
                        callback(err);
                    else
                        _this.view(designId, viewName, params, callback, tries);
                };
                if (tries <= 1 && err.name == "no_db_file")
                    _this.db.create(_afterResolve);
                else if (tries <= 2 && err.name == "not_found")
                    _this._persistDesign(designId, { 'views': [viewName] }, _afterResolve);
                else if (tries <= _this.db.maxTries && err.name == "conflict")
                    _this._performRetrieveLatest(designId, _afterResolve);
                else
                    callback(err);
            }
            else
                callback(undefined, result); // executed successfully
        });
    };
    DbDesign.prototype._performView = function (designId, viewName, params, callback) {
        this.db.raw.view(designId, viewName, params, function (err, data) {
            callback(err_1.default.make('design', err), data);
        });
    };
    DbDesign.prototype._performRetrieveLatest = function (designId, callback) {
        this.db.raw.get('_design/' + designId, function (err, result) {
            callback(err_1.default.make('design', err), result);
        });
    };
    DbDesign.prototype._persistDesign = function (designId, kinds, callback) {
        var design = this.db.designs[designId];
        if (!design) {
            callback(new err_1.default('design', "not_defined", "No design specified for: " + designId));
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
                        body.shows[name_1] = design.shows[name_1] || null;
                    }
                    break;
                case 'views':
                    body.views = {};
                    for (var _b = 0, _c = kinds[kind]; _b < _c.length; _b++) {
                        var name_2 = _c[_b];
                        body.views[name_2] = design.views[name_2] || null;
                    }
                    break;
            }
        }
        // persist document
        this.db.doc.updateOrPersist('_design/' + designId, body, callback);
    };
    return DbDesign;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DbDesign;
