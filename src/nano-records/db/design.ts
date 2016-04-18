import {default as Db, iNanoError, iDesignInput} from '../db';

export default class DbDesign
{
  db: Db;
  
  constructor (db: Db)
  {
    this.db = db;
  }
  
  show (designId: string, showName: string, id: string, callback: (err?: Error, data?: any)=>any = ()=>{}, tries: number = 0)
  {
    tries++;
    this.db.raw.show(designId, showName, id, (err: iNanoError, result: { [index: string]: any }) => {
      if (err) {
        let _afterResolve = (err: Error) => {
          if (err)
            callback(err);
          else
            this.show(designId, showName, id, callback, tries);
        };
        if (tries <= 1 && err.reason === 'no_db_file')
          this.db.persist(_afterResolve);
        else if (tries <= 2 && (['missing', 'deleted', 'missing_named_show'].indexOf(err.reason) > -1))
          this._persistDesign(designId, { 'shows': [showName] }, _afterResolve);
        else if (tries <= this.db.maxTries && err.name === 'conflict')
          this._performRetrieveLatest(designId, _afterResolve);
        else
          callback(err);
      }
      else
        callback(null, result); // executed successfully
    });
  }
  
  view (designId: string, viewName: string, params: Object, callback: (err?: Error, data?: any)=>any = ()=>{}, tries: number = 0)
  {
    tries++;
    this.db.raw.view(designId, viewName, params, (err: iNanoError, result: { [index: string]: any }) => {
      if (err) {
        let _afterResolve = (err: Error) => {
          if (err)
            callback(err);
          else
            this.view(designId, viewName, params, callback, tries);
        };
        if (tries <= 1 && err.reason === 'no_db_file')
          this.db.persist(_afterResolve);
        else if (tries <= 2 && (['missing', 'deleted', 'missing_named_view'].indexOf(err.reason) > -1))
          this._persistDesign(designId, { 'views': [viewName] }, _afterResolve);
        else if (tries <= this.db.maxTries && err.name === 'conflict')
          this._performRetrieveLatest(designId, _afterResolve);
        else
          callback(err);
      }
      else
        callback(null, result); // executed successfully
    });
  }
  
  private _performRetrieveLatest (designId: string, callback: (err: iNanoError, result: { [index: string]: any })=>any)
  {
    this.db.raw.get('_design/' + designId, callback);
  }
  
  private _persistDesign (designId: string, kinds: { [index: string]: string[] }, callback: (err: iNanoError)=>any)
  {
    let design = this.db.designs[designId];
    if (!design) {
      callback(new Error("No design specified for: " + designId));
      return;
    }
    // generate design document
    let body: iDesignInput = { language: design.language };
    for (let kind in kinds) {
      switch (kind) {
        case 'shows':
        body.shows = {};
        for (let name of kinds[kind]) {
          body.shows[name] = design.shows[name] || null;
        }
        break;
        case 'views':
        body.views = {};
        for (let name of kinds[kind]) {
          body.views[name] = design.views[name] || null;
        }
        break;
      }
    }
    // persist document
    this.db.doc.updateOrCreate('_design/' + designId, body, callback);
  }
}
