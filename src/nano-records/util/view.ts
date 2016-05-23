/* namespace ViewUtil
 * 
 * Helper functions mostly for use in generating views
 * for the view class.
 * 
 */

export namespace ViewUtil
{
  export function mapFunction (keys: string|string[], values?: string|string[]): string
  {
    // view map function generation
    let result: string = "emit(" + emitKey(keys) + "," + emitValue(values) + ");";
    let pfi = _parametersForIf(keys, values);
    if (pfi.length > 0)
      result = "if (" + pfi.join('&&') + ") { " + result + " }";
    result = "function (doc) { " + result + " }";
    return result;
  }
  
  function _parametersForIf (keys: string|string[], values?: string|string[]): string[]
  {
    // find nesting in keys to provision an if statement
    let result: string[] = [];
    if (keys instanceof Array)
      for (let key of keys) { _addParametersForIf(result, key); }
    else
      _addParametersForIf(result, keys);
    // find nesting in values to provision an if statement
    if (values) {
      if (values instanceof Array)
        for (let value of values) { _addParametersForIf(result, value); }
      else
        _addParametersForIf(result, values);
    }
    return result;
  }
  
  function _addParametersForIf (result: string[], name: string)
  {
    // find nesting in a single parameter
    let parts: string[] = name.split('.');
    if (parts.length > 1) {
      for (let i = 0; i < parts.length - 1; i++) {
        result.push("doc." + parts.slice(0, i + 1).join('.'));
      }
    }
  }

  export function emitKey (keys: string|string[]): string
  {
    // view map function emit key rendering
    if (keys instanceof Array) {
      let result: string[] = [];
      for (let key of keys) { result.push("doc." + key); }
      return "[" + result.join(',') + "]";
    }
    else
      return "doc." + keys;
  }

  export function emitValue (keys: string|string[]): string
  {
    // view map function emit value rendering
    if (!keys)
      return "null";
    if (!(keys instanceof Array))
      keys = <string[]>[keys];
    let assembled: SimpleObject = {};
    for (let key of keys) {
      _addNestedEmitValue(assembled, key.split('.'), key);
    }
    return JSON.stringify(assembled).replace(/"/g, "");
  }
  
  function _addNestedEmitValue(assembled: SimpleObject, parts: string[], orig: string)
  {
    if (parts.length > 1) {
      let key = parts.shift();
      assembled[key] = assembled[key] || {};
      _addNestedEmitValue(assembled[key], parts, orig);
    }
    else
      assembled[parts[0]] = "doc." + orig;
  }
  
  export function generateName (keys: string|string[], values?: string|string[]): string
  {
    // view name generation
    // for looking up views using key value combinations
    let name: string = "";
    if (keys instanceof Array) {
      let kk: string[] = [];
      for (let key of keys) {
        kk.push(key.split('.').join('_D_'));
      }
      name += kk.join('_K_') + '_A_';
    }
    else
      name += keys.split('.').join('_D_');
    if (values) {
      name += "_S_";
      if (values instanceof Array) {
        let vv: string[] = [];
        for (let value of values) {
          vv.push(value.split('.').join('_D_'));
        }
        name += vv.join('_V_') + '_A_';
      }
      else
        name += values.split('.').join('_D_');
    }
    return name;
  }
}
