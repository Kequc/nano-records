var err_1 = require('./err');
var doc_1 = require('./db/doc');
var design_1 = require('./db/design');
var deepExtend = require('deep-extend');
var Db = (function () {
    function Db(nano, dbName, designs) {
        if (designs === void 0) { designs = {}; }
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
        this.doc = new doc_1.default(this);
        this.design = new design_1.default(this);
    }
    Db.prototype.create = function (callback) {
        if (callback === void 0) { callback = function () { }; }
        this._performCreate(callback);
    };
    Db.prototype._performCreate = function (callback) {
        this.nano.db.create(this.dbName, function (err) {
            callback(err_1.default.make('db', err));
        });
    };
    Db.prototype.destroy = function (callback) {
        if (callback === void 0) { callback = function () { }; }
        this._performDestroy(callback);
    };
    Db.prototype._performDestroy = function (callback) {
        this.nano.db.destroy(this.dbName, function (err) {
            callback(err_1.default.make('db', err));
        });
    };
    return Db;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Db;
