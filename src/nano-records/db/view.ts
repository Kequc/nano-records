/* class DbDesign
 * 
 * Responsible for manipulation and execution of CouchDB design
 * document views. Will generally persist and update design documents
 * in the database and returns List objects resulting from design
 * queries.
 * 
 */

import {default as Err, ErrCallback, ErrResultCallback} from '../err';
import {default as Db} from '../db';
import {default as Doc} from '../doc';
import {default as List, ErrListCallback} from '../list';
import {DbViewBuilder} from './view/builder';
import _ = require('underscore');

interface ErrViewResultCallback {
  (err?: Err, result?: ViewResult): any;
}

export default class DbView
{
  db: Db;
  
  constructor (db: Db)
  {
    this.db = db;
  }
  
  only (keys: string|string[], values: string|string[], params: SimpleObject, callback: ErrListCallback)
  {
    // generated views consisiting of provided keys and values
    if (!keys)
      callback(Err.missingParam('view', "keys"));
    else if (!values)
      callback(Err.missingParam('view', "values"));
    else if (!params)
      callback(Err.missingParam('view', "params"));
    else
      this._only(keys, values, params, callback);
  }
  
  all (keys: string|string[], params: SimpleObject, callback: ErrListCallback)
  {
    // generated views consisiting of provided keys and full documents
    if (!keys)
      callback(Err.missingParam('view', "keys"));
    else if (!params)
      callback(Err.missingParam('view', "params"));
    else {
      let extended = { include_docs: true };
      this._only(keys, undefined, _.extend({}, params, extended), callback);
    }
  }
  
  private _only (keys: string|string[], values: string|string[], params: SimpleObject, callback: ErrListCallback, tries: number = 0)
  {
    tries++;
    let name = DbViewBuilder.generateName(keys, values);
    this._performCatalog("_nano_records", name, params, (err, result) => {
      if (err) {
        if (tries <= 1 && (err.name == "no_db_file" || err.name == "not_found")) {
          let view = {
            map: DbViewBuilder.mapFunction(keys, values)
          };
          this._updateNanoRecordsDesign(name, view, (err) => {
            if (err)
              callback(err);
            else
              this._only(keys, values, params, callback, tries);
          });
        }
        else
          callback(err);
      }
      else
        callback(undefined, new List(this.db, result)); // executed successfully
    });
  }
  
  private _updateNanoRecordsDesign (name: string, view: { map: string, reduce?: string }, callback: ErrCallback)
  {
    // generate design view
    let body: DesignInput = { language: "javascript", views: {} };
    body.views[name] = view;
    this.db.doc.updateOrWrite('_design/_nano_records', body, callback);
  }
  
  // TODO: we need a way to force persist individual views in
  // cases where they have been changed
  
  catalog (design: string, name: string, params: SimpleObject, callback: ErrListCallback = ()=>{})
  {
    if (!design)
      callback(Err.missingParam('view', "design"));
    else if (!name)
      callback(Err.missingParam('view', "name"));
    else if (!params)
      callback(Err.missingParam('view', "params"));
    else
      this._catalog(design, name, params, callback);
  }
  
  private _catalog (design: string, name: string, params: SimpleObject, callback: ErrListCallback, tries: number = 0)
  {
    tries++;
    this._performCatalog(design, name, params, (err, result) => {
      if (err) {
        if (tries <= 1 && (err.name == "no_db_file" || err.name == "not_found")) {
          this._updateDesign(design, [name], (err) => {
            if (err)
              callback(err);
            else
              this._catalog(design, name, params, callback, tries);
          });
        }
        else
          callback(err);
      }
      else
        callback(undefined, new List(this.db, result)); // executed successfully
    });
  }
  
  private _performCatalog (design: string, name: string, params: SimpleObject, callback: ErrViewResultCallback)
  {
    this.db.raw.view(design, name, params, Err.resultFunc('view', callback));
  }
    
  private _updateDesign (designId: string, names: string[], callback: ErrCallback)
  {
    let design = this.db.designs[designId];
    if (!design) {
      callback(new Err('view', "not_defined", "No design specified for: " + designId));
      return;
    }
   
    // generate design document
    let body: DesignInput = { language: design.language, views: {} };
    for (let name of names) {
      if (design.views[name])
        body.views[name] = design.views[name];
      else {
        callback(new Err('view', "missing_view", "Missing deinition for: " + name));
        return;
      }
    }
    
    // update design
    this.db.doc.updateOrWrite('_design/' + designId, body, callback);
  }
}
