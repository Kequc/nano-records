var DbDesign = (function () {
    function DbDesign(db) {
        this.db = db;
    }
    DbDesign.prototype.show = function (designId, showName, id, callback, tries) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        tries++;
        this.db.raw.show(designId, showName, id, function (err, result) {
            if (err) {
                var _afterResolve = function (err) {
                    if (err)
                        callback(err);
                    else
                        _this.show(designId, showName, id, callback, tries);
                };
                if (tries <= 1 && err.reason === 'no_db_file')
                    _this.db.persist(_afterResolve);
                else if (tries <= 2 && (['missing', 'deleted', 'missing_named_show'].indexOf(err.reason) > -1))
                    _this._persistDesign(designId, { 'shows': [showName] }, _afterResolve);
                else if (tries <= _this.db.maxTries && err.name === 'conflict')
                    _this._performRetrieveLatest(designId, _afterResolve);
                else
                    callback(err);
            }
            else
                callback(null, result); // executed successfully
        });
    };
    DbDesign.prototype.view = function (designId, viewName, params, callback, tries) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (tries === void 0) { tries = 0; }
        tries++;
        this.db.raw.view(designId, viewName, params, function (err, result) {
            if (err) {
                var _afterResolve = function (err) {
                    if (err)
                        callback(err);
                    else
                        _this.view(designId, viewName, params, callback, tries);
                };
                if (tries <= 1 && err.reason === 'no_db_file')
                    _this.db.persist(_afterResolve);
                else if (tries <= 2 && (['missing', 'deleted', 'missing_named_view'].indexOf(err.reason) > -1))
                    _this._persistDesign(designId, { 'views': [viewName] }, _afterResolve);
                else if (tries <= _this.db.maxTries && err.name === 'conflict')
                    _this._performRetrieveLatest(designId, _afterResolve);
                else
                    callback(err);
            }
            else
                callback(null, result); // executed successfully
        });
    };
    DbDesign.prototype._performRetrieveLatest = function (designId, callback) {
        this.db.raw.get('_design/' + designId, callback);
    };
    DbDesign.prototype._persistDesign = function (designId, kinds, callback) {
        var design = this.db.designs[designId];
        if (!design) {
            callback(new Error("No design specified for: " + designId));
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
        this.db.doc.updateOrCreate('_design/' + designId, body, callback);
    };
    return DbDesign;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DbDesign;
