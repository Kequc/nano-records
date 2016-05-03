/* class DbDesign
 * 
 * Responsible for manipulation and execution of CouchDB design
 * documents. Will generally persist and update design documents
 * in the database and returns raw data resulting from design
 * queries.
 * 
 */

import {default as Err, ErrCallback, ErrOutputCallback} from '../err';
import {default as Db} from '../db';
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
  
  show (id: string, name: string, docId: string, callback: ErrOutputCallback = ()=>{})
  {
    if (!id)
      callback(Err.missingId('design'));
    else if (!name)
      callback(Err.missingParam('design', "name"));
    else if (!docId)
      callback(Err.missingParam('design', "docId"));
    else
      this._show(id, name, docId, callback);
  }
  
  private _show (id: string, name: string, docId: string, callback: ErrOutputCallback, tries: number = 0)
  {
    tries++;
    this._performShow(id, name, docId, (err, result) => {
      if (err) {
        if (tries <= 1 && (err.name == "no_db_file" || err.name == "not_found")) {
          this._updateDesign(id, { 'shows': [name] }, (err) => {
            if (err)
              callback(err);
            else
              this._show(id, name, docId, callback, tries);
          });
        }
        else
          callback(err);
      }
      else
        callback(undefined, result); // executed successfully
    });
  }
  
  private _performShow (id: string, name: string, docId: string, callback: ErrOutputCallback)
  {
    this.db.raw.show(id, name, docId, Err.resultFunc('design', callback));
  }
  
  view (id: string, name: string, params: SimpleObject, callback: ErrOutputCallback = ()=>{})
  {
    if (!id)
      callback(Err.missingId('doc'));
    else if (!name)
      callback(Err.missingParam('design', "name"));
    else if (!params)
      callback(Err.missingParam('design', "params"));
    else
      this._view(id, name, params, callback);
  }
  
  private _view (id: string, name: string, params: SimpleObject, callback: ErrOutputCallback, tries: number = 0)
  {
    tries++;
    this._performView(id, name, params, (err, result) => {
      if (err) {
        if (tries <= 1 && (err.name == "no_db_file" || err.name == "not_found")) {
          this._updateDesign(id, { 'views': [name] }, (err) => {
            if (err)
              callback(err);
            else
              this._view(id, name, params, callback, tries);
          });
        }
        else
          callback(err);
      }
      else
        callback(undefined, result); // executed successfully
    });
  }
  
  private _performView (id: string, name: string, params: SimpleObject, callback: ErrOutputCallback)
  {
    this.db.raw.view(id, name, params, Err.resultFunc('design', callback));
  }
  
  private _updateDesign (id: string, kinds: { [index: string]: string[] }, callback: ErrCallback)
  {
    let design = this.db.designs[id];
    if (!design) {
      callback(new Err('design', "not_defined", "No design specified for: " + id));
      return;
    }
    
    // generate design document
    let body: DesignInput = { language: design.language };
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
