/* class List
 *
 * Represents a single result set containing references
 * to documents but perhaps only limited data from
 * each of them.
 *
 * Used in general for returned views.
 *
 */
"use strict";
var doc_1 = require('./doc');
var _ = require('underscore');
var List = (function () {
    function List(db, body) {
        this.db = db;
        this.total = body.total_rows;
        this.offset = body.offset;
        this.rows = body.rows;
    }
    List.prototype.ids = function () {
        return _.map(this.rows, function (row) { return row.id; });
    };
    List.prototype.keys = function () {
        return _.map(this.rows, function (row) { return row.key; });
    };
    List.prototype.values = function () {
        return _.map(this.rows, function (row) { return row.doc || row.value; });
    };
    List.prototype.docs = function () {
        var _this = this;
        return _.map(this.rows, function (row) { return new doc_1.default(_this.db, (row.doc || row.value), { id: row.id }); });
    };
    List.prototype.doc = function (index) {
        var row = this.rows[index];
        return (row ? new doc_1.default(this.db, (row.doc || row.value), { id: row.id }) : undefined);
    };
    return List;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = List;
