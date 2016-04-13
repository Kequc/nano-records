var doc_1 = require('./db/doc');
var design_1 = require('./db/design');
var Db = (function () {
    function Db(nano, dbName, designs) {
        this.maxTries = 5;
        this.designs = {};
        this.nano = nano;
        this.dbName = dbName;
        this._updateDesigns(designs);
        this.raw = this.nano.use(this.dbName);
        this.doc = new doc_1.default(this);
        this.design = new design_1.default(this);
    }
    Db.prototype._updateDesigns = function (designs) {
        if (designs === void 0) { designs = {}; }
        for (var key in designs) {
            var design = designs[key] || {};
            this.designs[key] = {
                language: design.language || "javascript",
                shows: design.shows || {},
                views: design.views || {}
            };
        }
    };
    return Db;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Db;
