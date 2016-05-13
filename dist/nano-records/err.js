/* class Err
 *
 * This is a utility class for manufacturing errors returned from nano
 * into a more structured format. Calling `make` and delivering the
 * original error should result in something sane.
 *
 * This is used internally as well as delivered to the user it acts as
 * a sanity check for nano erros.
 *
 */
"use strict";
var Err = (function () {
    function Err(scope, name, message, raw) {
        this.scope = scope;
        this.name = name || "unknown_error";
        this.message = message || "No additional information available.";
        this.raw = raw || {};
    }
    Err.resultFunc = function (scope, callback) {
        return function (raw, result) {
            var err = Err.make(scope, raw);
            if (err)
                callback(err);
            else
                callback(undefined, result);
        };
    };
    Err.make = function (scope, err) {
        if (!err)
            return;
        else if (err.statusCode == 412) {
            // database create requested when database exists
            return new Err(scope, "db_already_exists", "Database already exists.", err);
        }
        else if ((err.statusCode == 404 && scope == 'db') || err.reason == "no_db_file") {
            // database destroy requested when database does not exist
            // database missing error
            return new Err(scope, "no_db_file", "Database missing.", err);
        }
        else if (err.statusCode == 404) {
            // something missing
            return this.missing(scope, err);
        }
        else if (err.statusCode == 409) {
            // revision mismatch
            return this.conflict(scope, err);
        }
        else if (err.error == "doc_validation") {
            // something weird like insert of an _updated attribute
            return new Err(scope, "doc_validation", "Bad document member.", err);
        }
        else if (err.statusCode == 500 && scope == 'design' && err.error == "TypeError") {
            // NANO: that is one hell of an error, man crazy
            // seems to only occur when a show is missing
            // views do not report such a crazy error nor need this exception
            return this.missing(scope, err);
        }
        else if (err.code == 'ECONNREFUSED') {
            // could not connect to the database
            return new Err(scope, "connection_refused", "Could not connect to database.", err);
        }
        else if (err.statusCode == 500 && err.scope == 'couch') {
            // design broken somehow
            return new Err(scope, "malformed_script", "Problem with one of your designs.", err);
        }
        else {
            // best guess!
            return new Err(scope, err.reason, err.description, err);
        }
    };
    // common ones
    Err.missing = function (scope, err) {
        return new Err(scope, "not_found", "Not found.", err);
    };
    Err.missingId = function (scope) {
        return new Err(scope, "missing_id", "Id parameter required.");
    };
    Err.missingParam = function (scope, name) {
        var cName = name[0].toUpperCase() + name.slice(1);
        return new Err(scope, "missing_param", cName + " parameter required.");
    };
    Err.conflict = function (scope, err) {
        return new Err(scope, "conflict", "There was a conflict.", err);
    };
    Err.verifyFailed = function (scope) {
        return new Err(scope, "verify_failed", "Verify code mismatch.");
    };
    return Err;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Err;
