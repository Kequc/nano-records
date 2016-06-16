/* class Db
 *
 * Maintains a set of core settings for the database instance.
 * Also offers some basic database functions such as create and
 * destroy.
 *
 * Delivers an entry point into all other classes.
 *
 */
"use strict";
var err_1 = require('./err');
var db_doc_1 = require('./db-doc');
var db_view_1 = require('./db-view');
var db_show_1 = require('./db-show');
var deepExtend = require('deep-extend');
var Db = (function () {
    function Db(nano, dbName, designs) {
        this.maxTries = 5;
        this.designs = {};
        this.nano = nano;
        this.dbName = dbName;
        this.raw = this.nano.use(this.dbName);
        for (var key in designs) {
            this.designs[key] = {
                language: "javascript",
                shows: {},
                views: {}
            };
        }
        deepExtend(this.designs, designs);
        this.doc = new db_doc_1.default(this);
        this.view = new db_view_1.default(this);
        this.show = new db_show_1.default(this);
    }
    Db.prototype.create = function (callback) {
        if (callback === void 0) { callback = function () { }; }
        this._performCreate(callback);
    };
    Db.prototype._performCreate = function (callback) {
        this.nano.db.create(this.dbName, err_1.default.resultFunc('db', callback));
    };
    Db.prototype.destroy = function (verify, callback) {
        if (callback === void 0) { callback = function () { }; }
        if (verify !== "_DESTROY_")
            callback(err_1.default.verifyFailed('db'));
        else
            this._performDestroy(callback);
    };
    Db.prototype._performDestroy = function (callback) {
        this.nano.db.destroy(this.dbName, err_1.default.resultFunc('db', callback));
    };
    Db.prototype.reset = function (verify, callback) {
        var _this = this;
        if (callback === void 0) { callback = function () { }; }
        if (verify !== "_RESET_")
            callback(err_1.default.verifyFailed('db'));
        else {
            this.destroy("_DESTROY_", function (err) {
                if (!err || err.name == "no_db_file")
                    _this.create(callback);
                else
                    callback(err);
            });
        }
    };
    return Db;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Db;
