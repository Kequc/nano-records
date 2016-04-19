var Err = (function () {
    function Err(scope, name, message, raw) {
        this.scope = scope;
        this.name = name || "unknown_error";
        this.message = message || "No additional information available.";
        this.raw = raw || {};
    }
    Err.make = function (scope, err) {
        if (!err)
            return;
        else if (err.statusCode == 412)
            return new Err(scope, "db_already_exists", "Database already exists.", err);
        else if (err.reason == "no_db_file")
            return new Err(scope, "no_db_file", "Database missing.", err);
        else if (err.statusCode == 404)
            return this.missing(scope, err);
        else if (err.statusCode == 409)
            return new Err(scope, "conflict", "There was a conflict.", err);
        else
            return new Err(scope, err.reason, err.description, err);
    };
    Err.missing = function (scope, err) {
        return new Err(scope, "not_found", "Not found.", err);
    };
    return Err;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Err;
