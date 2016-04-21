"use strict";
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
        else if (err.statusCode == 412) {
            // database create requests when database exists
            return new Err(scope, "db_already_exists", "Database already exists.", err);
        }
        else if ((err.statusCode == 404 && scope == 'db') || err.reason == "no_db_file") {
            // database destroy requests when database does not exist
            // database missing errors
            return new Err(scope, "no_db_file", "Database missing.", err);
        }
        else if (err.statusCode == 404) {
            // something missing
            return this.missing(scope, err);
        }
        else if (err.statusCode == 409) {
            // revision mismatch
            return new Err(scope, "conflict", "There was a conflict.", err);
        }
        else if (err.statusCode == 500 && ['function_clause', 'case_clause'].indexOf(err.reason) > -1) {
            // design broken somehow
            return new Err(scope, "malformed_script", "Problem with one of your designs.", err);
        }
        else if (err.statusCode == 500 && scope == 'design' && err.error == "TypeError") {
            // FIXME: NANO that is one hell of an error
            // seems to only occur when a show is missing
            // views do not have this issue
            return this.missing(scope, err);
        }
        else if (err.code == 'ECONNREFUSED') {
            // could not contact database
            return new Err(scope, "connection_refused", "Could not connect to database.", err);
        }
        else {
            // best guess!
            return new Err(scope, err.reason, err.description, err);
        }
    };
    Err.missing = function (scope, err) {
        return new Err(scope, "not_found", "Not found.", err);
    };
    Err.missingId = function (scope) {
        return new Err(scope, "missing_id", "Id parameter required.");
    };
    Err.verifyFailed = function (scope) {
        return new Err(scope, "verify_failed", "Verify code mismatch.");
    };
    return Err;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Err;
