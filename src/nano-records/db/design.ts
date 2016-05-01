/* class DbDesign
 * 
 * Responsible for manipulation and execution of CouchDB design
 * documents. Will generally persist and update design documents
 * in the database and returns raw data resulting from design
 * queries.
 * 
 */

import {default as Err} from '../err';
import {default as Db, iDesignInput} from '../db';
import {default as Doc} from '../doc';

export default class DbDesign
{
  db: Db;
  
  constructor (db: Db)
  {
    this.db = db;
  }
  // TODO: we need a way to force persist individual views and shows
  // in cases where they have been changed
  // TODO: we probably need a separate interface for interacting with
  // the results from this class
  
  show (id: string, name: string, docId: string, callback: (err?: Err, result?: any)=>any = ()=>{}, tries: number = 0)
  {
    tries++;
    if (!id) {
      callback(Err.missingId('design'));
      return;
    }
    this._performShow(id, name, docId, (err, result) => {
      if (err) {
        if (tries <= 1 && (err.name == "no_db_file" || err.name == "not_found")) {
          this._updateDesign(id, { 'shows': [name] }, (err: Err) => {
            if (err)
              callback(err);
            else
              this.show(id, name, docId, callback, tries);
          });
        }
        else
          callback(err);
      }
      else
        callback(undefined, result); // executed successfully
    });
  }
  
  private _performShow (id: string, name: string, docId: string, callback: (err: Err, result?: any)=>any)
  {
    this.db.raw.show(id, name, docId, Err.resultFunc('design', callback));
  }
  
  view (id: string, name: string, params: Object, callback: (err?: Err, result?: any)=>any = ()=>{}, tries: number = 0)
  {
    tries++;
    if (!id) {
      callback(Err.missingId('doc'));
      return;
    }
    this._performView(id, name, params, (err, result) => {
      if (err) {
        if (tries <= 1 && (err.name == "no_db_file" || err.name == "not_found")) {
          this._updateDesign(id, { 'views': [name] }, (err: Err) => {
            if (err)
              callback(err);
            else
              this.view(id, name, params, callback, tries);
          });
        }
        else
          callback(err);
      }
      else
        callback(undefined, result); // executed successfully
    });
  }
  
  private _performView (id: string, name: string, params: Object, callback: (err: Err, result?: any)=>any)
  {
    this.db.raw.view(id, name, params, Err.resultFunc('design', callback));
  }
  
  private _performRetrieveLatest (id: string, callback: (err: Err, result?: { [index: string]: any })=>any)
  {
    this.db.raw.get('_design/' + id, Err.resultFunc('design', callback));
  }
  
  private _updateDesign (id: string, kinds: { [index: string]: string[] }, callback: (err: Err)=>any)
  {
    let design = this.db.designs[id];
    if (!design) {
      callback(new Err('design', "not_defined", "No design specified for: " + id));
      return;
    }
    
    // generate design document
    let body: iDesignInput = { language: design.language };
    for (let kind in kinds) {
      switch (kind) {
        case 'shows':
        body.shows = {};
        for (let name of kinds[kind]) {
          if (design.shows[name])
            body.shows[name] = design.shows[name];
          else {
            callback(new Err('design', "missing_show", "Missing deinition for: " + name));
            return;
          }
        }
        break;
        case 'views':
        body.views = {};
        for (let name of kinds[kind]) {
          if (design.views[name])
            body.views[name] = design.views[name];
          else {
            callback(new Err('design', "missing_view", "Missing deinition for: " + name));
            return;
          }
        }
        break;
      }
    }
    
    // update design
    this.db.doc.forcedUpdate('_design/' + id, body, callback);
  }
}
