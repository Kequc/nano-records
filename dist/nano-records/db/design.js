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
                if (tries <= 1 && (['missing', 'deleted', 'missing_named_show'].indexOf(err.reason) > -1)) {
                    _this._persistDesign(designId, 'shows', showName, function (err) {
                        if (err)
                            callback(err);
                        else
                            _this.show(designId, showName, id, callback, tries);
                    });
                }
                else if (tries <= _this.db.maxTries && err.name === 'conflict') {
                    _this._performRetrieveLatest(designId, function (err) {
                        if (err)
                            callback(err);
                        else
                            _this.show(designId, showName, id, callback, tries);
                    });
                }
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
                if (tries <= 1 && (['missing', 'deleted', 'missing_named_view'].indexOf(err.reason) > -1)) {
                    _this._persistDesign(designId, 'views', viewName, function (err) {
                        if (err)
                            callback(err);
                        else
                            _this.view(designId, viewName, params, callback, tries);
                    });
                }
                else if (tries <= _this.db.maxTries && err.name === 'conflict') {
                    _this._performRetrieveLatest(designId, function (err) {
                        if (err)
                            callback(err);
                        else
                            _this.view(designId, viewName, params, callback, tries);
                    });
                }
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
    DbDesign.prototype._persistDesign = function (designId, kind, name, callback) {
        var design = this.db.designs[designId];
        if (!design) {
            callback(new Error("No design specified for: " + designId));
            return;
        }
        // persist document
        var body = { language: design.language };
        switch (kind) {
            case 'shows':
                body.shows = {};
                body.shows[name] = design.shows[name] || null;
                break;
            case 'views':
                body.views = {};
                body.views[name] = design.views[name] || null;
                break;
        }
        this.db.doc.updateOrCreate('_design/' + designId, body, callback);
    };
    return DbDesign;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DbDesign;
