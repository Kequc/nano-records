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
    Db.prototype.persist = function (callback) {
        if (callback === void 0) { callback = function () { }; }
        this._performPersist(function (err) {
            if (err)
                callback(err);
            else
                callback(null);
        });
    };
    Db.prototype._performPersist = function (callback) {
        this.nano.db.create(this.dbName, callback);
    };
    return Db;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Db;
