/* class DbShow
 * 
 * Responsible for manipulation and execution of CouchDB design
 * document shows. Will generally persist and update design documents
 * in the database and returns raw data resulting from design
 * queries.
 * 
 */

import {default as Err, ErrCallback, ErrResultCallback} from '../err';
import {default as Db} from '../db';
import {default as Doc} from '../doc';
import {default as List, ErrListCallback} from '../list';

export default class DbDesign
{
  db: Db;
  
  constructor (db: Db)
  {
    this.db = db;
  }
  
  // TODO: we need a way to force persist individual shows in
  // cases where they have been changed
  
  read (id: string, name: string, docId: string, callback: ErrResultCallback = ()=>{})
  {
    if (!id)
      callback(Err.missingId('design'));
    else if (!name)
      callback(Err.missingParam('design', "name"));
    else if (!docId)
      callback(Err.missingParam('design', "docId"));
    else
      this._read(id, name, docId, callback);
  }
  
  private _read (id: string, name: string, docId: string, callback: ErrResultCallback, tries: number = 0)
  {
    tries++;
    this._performRead(id, name, docId, (err, result) => {
      if (err) {
        if (tries <= 1 && (err.name == "no_db_file" || err.name == "not_found")) {
          this._updateDesign(id, [name], (err) => {
            if (err)
              callback(err);
            else
              this._read(id, name, docId, callback, tries);
          });
        }
        else
          callback(err);
      }
      else
        callback(undefined, result); // executed successfully
    });
  }
  
  private _performRead (id: string, name: string, docId: string, callback: ErrResultCallback)
  {
    this.db.raw.show(id, name, docId, Err.resultFunc('design', callback));
  }
  
  private _updateDesign (id: string, names: string[], callback: ErrCallback)
  {
    let design = this.db.designs[id];
    if (!design) {
      callback(new Err('design', "not_defined", "No design specified for: " + id));
      return;
    }
    
    // generate design document
    let body: DesignInput = { language: design.language, shows: {} };
    for (let name of names) {
      if (design.shows[name])
        body.shows[name] = design.shows[name];
      else {
        callback(new Err('design', "missing_show", "Missing deinition for: " + name));
        return;
      }
    }
    
    // update design
    this.db.doc.forcedUpdate('_design/' + id, body, callback);
  }
}
