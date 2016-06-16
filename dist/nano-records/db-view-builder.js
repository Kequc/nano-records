/* namespace DbViewBuilder
 *
 * Helper functions mostly for use in generating views
 * for the view class.
 *
 */
"use strict";
var DbViewBuilder;
(function (DbViewBuilder) {
    function mapFunction(keys, values) {
        // view map function generation
        var result = "emit(" + emitKey(keys) + "," + emitValue(values) + ");";
        var pfi = _parametersForIf(keys, values);
        if (pfi.length > 0)
            result = "if (" + pfi.join('&&') + ") { " + result + " }";
        result = "function (doc) { " + result + " }";
        return result;
    }
    DbViewBuilder.mapFunction = mapFunction;
    function _parametersForIf(keys, values) {
        // find nesting in keys to provision an if statement
        var result = [];
        if (keys instanceof Array)
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                _addParametersForIf(result, key);
            }
        else
            _addParametersForIf(result, keys);
        // find nesting in values to provision an if statement
        if (values) {
            if (values instanceof Array)
                for (var _a = 0, values_1 = values; _a < values_1.length; _a++) {
                    var value = values_1[_a];
                    _addParametersForIf(result, value);
                }
            else
                _addParametersForIf(result, values);
        }
        return result;
    }
    function _addParametersForIf(result, name) {
        // find nesting in a single parameter
        var parts = name.split('.');
        if (parts.length > 1) {
            for (var i = 0; i < parts.length - 1; i++) {
                result.push("doc." + parts.slice(0, i + 1).join('.'));
            }
        }
    }
    function emitKey(keys) {
        // view map function emit key rendering
        if (keys instanceof Array) {
            var result = [];
            for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
                var key = keys_2[_i];
                result.push("doc." + key);
            }
            return "[" + result.join(',') + "]";
        }
        else
            return "doc." + keys;
    }
    DbViewBuilder.emitKey = emitKey;
    function emitValue(keys) {
        // view map function emit value rendering
        if (!keys)
            return "null";
        if (!(keys instanceof Array))
            keys = [keys];
        var assembled = {};
        for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
            var key = keys_3[_i];
            _addNestedEmitValue(assembled, key.split('.'), key);
        }
        return JSON.stringify(assembled).replace(/"/g, "");
    }
    DbViewBuilder.emitValue = emitValue;
    function _addNestedEmitValue(assembled, parts, orig) {
        if (parts.length > 1) {
            var key = parts.shift();
            assembled[key] = assembled[key] || {};
            _addNestedEmitValue(assembled[key], parts, orig);
        }
        else
            assembled[parts[0]] = "doc." + orig;
    }
    function generateName(keys, values) {
        // view name generation
        // for looking up views using key value combinations
        var name = "";
        if (keys instanceof Array) {
            var kk = [];
            for (var _i = 0, keys_4 = keys; _i < keys_4.length; _i++) {
                var key = keys_4[_i];
                kk.push(key.split('.').join('_D_'));
            }
            name += kk.join('_K_') + '_A_';
        }
        else
            name += keys.split('.').join('_D_');
        if (values) {
            name += "_S_";
            if (values instanceof Array) {
                var vv = [];
                for (var _a = 0, values_2 = values; _a < values_2.length; _a++) {
                    var value = values_2[_a];
                    vv.push(value.split('.').join('_D_'));
                }
                name += vv.join('_V_') + '_A_';
            }
            else
                name += values.split('.').join('_D_');
        }
        return name;
    }
    DbViewBuilder.generateName = generateName;
})(DbViewBuilder = exports.DbViewBuilder || (exports.DbViewBuilder = {}));
