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
  
  catalog (id: string, design: string, name: string, callback: ErrResultCallback = ()=>{})
  {
    if (!id)
      callback(Err.missingId('show'));
    else if (!design)
      callback(Err.missingParam('show', "design"));
    else if (!name)
      callback(Err.missingParam('show', "name"));
    else
      this._catalog(id, design, name, callback);
  }
  
  private _catalog (id: string, design: string, name: string, callback: ErrResultCallback, tries: number = 0)
  {
    tries++;
    this._performCatalog(id, design, name, (err, result) => {
      if (err) {
        if (tries <= 1 && (err.name == "no_db_file" || err.name == "not_found")) {
          this._updateDesign(design, [name], (err) => {
            if (err)
              callback(err);
            else
              this._catalog(id, design, name, callback, tries);
          });
        }
        else
          callback(err);
      }
      else
        callback(undefined, result); // executed successfully
    });
  }
  
  private _performCatalog (id: string, design: string, name: string, callback: ErrResultCallback)
  {
    this.db.raw.show(design, name, id, Err.resultFunc('design', callback));
  }
  
  private _updateDesign (designId: string, names: string[], callback: ErrCallback)
  {
    let design = this.db.designs[designId];
    if (!design) {
      callback(new Err('show', "not_defined", "No design specified for: " + designId));
      return;
    }
    
    // generate design document
    let body: DesignInput = { language: design.language, shows: {} };
    for (let name of names) {
      if (design.shows[name])
        body.shows[name] = design.shows[name];
      else {
        callback(new Err('show', "missing_show", "Missing deinition for: " + name));
        return;
      }
    }
    
    // update design
    this.db.doc.updateOrWrite('_design/' + designId, body, callback);
  }
}
